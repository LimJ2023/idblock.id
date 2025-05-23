import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import {
  ConfirmEmailVerificationDto,
  insertUserSchema,
  LoginDto,
  RefreshTokenDto,
  RequestEmailVerificationDto,
  ResetPaswordDto,
  SignUpDto,
  Step1VerificationDto,
  UpdateInfoDto,
  DeleteEmailVerificationDto,
  DeleteUserDto,
} from './auth.dto';
import { Request, Response } from 'express';
import * as v from 'valibot';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { addDays, addYears } from 'date-fns';
import { CurrentUser } from './current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/s3/s3.dto';
import { S3Service } from 'src/s3/s3.service';
import {
  AlreadyUserDto,
  EmailVerificationRequest,
  LoginResponse,
} from './auth.response.dto';
import {
  ApiDuplicateHttpExceptionResponse,
  ApiResponseData,
} from 'src/common/common.dto';
import { EnvService } from 'src/env/env.service';
import { ERROR_CODE } from 'src/common/error-code';

@Controller('auth')
@ApiTags('인증')
@ApiExtraModels(LoginResponse, EmailVerificationRequest, AlreadyUserDto)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
    private readonly envService: EnvService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: '로그인',
  })
  @ApiResponseData(HttpStatus.OK, LoginResponse)
  @ApiBadRequestResponse({
    example: {
      message: ERROR_CODE.INVALID_LOGIN_DATA,
    },
  })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } = await this.authService.login(
      body.data,
    );
    await this.authService.createSession(userId, refreshToken);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      expires: addDays(new Date(), 1),
      sameSite: 'none',
      domain:
        req.hostname === 'localhost' ?
          undefined
        : this.envService.get('COOKIE_DOMAIN'),
      secure: true,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      expires: addYears(new Date(), 1),
      sameSite: 'none',
      domain:
        req.hostname === 'localhost' ?
          undefined
        : this.envService.get('COOKIE_DOMAIN'),
      secure: true,
      path: '/',
    });
    return { accessToken, refreshToken };
  }

  @Delete('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiBearerAuth()
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() userId: string,
  ) {
    await this.authService.deleteSession(userId);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      domain:
        req.hostname === 'localhost' ?
          undefined
        : this.envService.get('COOKIE_DOMAIN'),
      secure: true,
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'none',
      domain:
        req.hostname === 'localhost' ?
          undefined
        : this.envService.get('COOKIE_DOMAIN'),
      secure: true,
      path: '/',
    });

    return 'Logged out';
  }

  @Public()
  @Post('/verify-email/request')
  @ApiOperation({ summary: '이메일 인증 요청' })
  @ApiDuplicateHttpExceptionResponse(HttpStatus.BAD_REQUEST, AlreadyUserDto)
  @ApiResponseData(HttpStatus.CREATED, EmailVerificationRequest)
  @ApiBadRequestResponse({
    example: {
      message: ERROR_CODE.ALREADY_USED_EMAIL,
    },
  })
  async requestEmailVerification(@Body() body: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(body.data.email);
  }

  @Public()
  @Post('/verify-email/confirm')
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiCreatedResponse({
    example: {
      id: '55',
      email: 'pablo@buttersoft.io',
      uuid: 'e2cf6839-121d-4108-8c8e-1000e484935f',
      createdAt: '2024-11-25T02:58:39.632Z',
      code: '643601',
      isVerified: true,
    },
  })
  async confirmEmailVerification(@Body() body: ConfirmEmailVerificationDto) {
    return this.authService.confirmEmailVerification(
      body.data.email,
      body.data.uuid,
      body.data.code,
    );
  }

  @Public()
  @Post('delete-email-verification')
  @ApiOperation({ summary: '이메일 인증 삭제' })
  async deleteEmailVerification(@Body() body: DeleteEmailVerificationDto) {
    return this.authService.deleteEmailVerification(body.data.email);
  }

  @Public()
  @Post('sign-up/verify-step1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원가입 단계1' })
  @ApiBadRequestResponse({
    example: {
      message: ERROR_CODE.ALREADY_USED_PASSPORT_NUMBER,
    },
  })
  async signupVerifyStep1(@Body() body: Step1VerificationDto) {
    return this.authService.signupVerifyStep1(body.data);
  }

  @Public()
  @Post('sign-up')
  @ApiOperation({ summary: '회원가입' })
  @ApiBadRequestResponse({
    example: {
      message: ERROR_CODE.ALREADY_USED_EMAIL,
    },
  })
  async signup(@Body() body: SignUpDto) {
    await this.authService.emailVerificationCheck(
      body.data.uuid,
      body.data.email,
    );

    const created = await this.authService.createUser(
      v.parse(insertUserSchema, body.data, {}),
    );
    if (!created) {
      throw new BadRequestException(ERROR_CODE.ALREADY_USED_EMAIL);
    }
    const [user] = created;
    await this.authService.createUserVerificationDocument(
      user.id,
      body.data.passportImageKey,
      body.data.profileImageKey,
    );
    return user;
  }

  @Public()
  @Post('upload/passport-recognition')
  @ApiOperation({ summary: '여권 인식' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    type: FileUploadDto,
  })
  async uploadPassportRecognition(@UploadedFile() file: Express.Multer.File) {
    return this.authService.argosRecognition(file);
  }
  
  @Public()
  @Post('upload/passport-image')
  @ApiOperation({ summary: '여권 업로드' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    type: FileUploadDto,
  })
  async uploadPassport(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.uploadFile(file, 'private/passport/');
  }

  @Public()
  @Post('upload/profile-image')
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    type: FileUploadDto,
  })
  async uploadProfile(@UploadedFile() file: Express.Multer.File) {
    return this.s3Service.uploadFile(file, 'private/profile/');
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: '프로필 조회' })
  @ApiOkResponse({
    example: {
      data: {
        data: {
          id: '15',
          email: 'hkchae@buttersoft.io',
          name: '홍길동',
          city: {
            id: '1835848',
            name: 'Seoul',
            country: 'South Korea',
            coutryCode: 'KR',
          },
          status: 'APPROVED',
          profileImage:
            'https://crosshub-dev.s3.ap-northeast-2.amazonaws.com/private/profile/6d60d03bb9497e4478d33d1ba40d8e285beaada2a2e39f4388194fbb866d6662?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQSOI4XGLZ75CLB7P%2F20241125%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20241125T031304Z&X-Amz-Expires=900&X-Amz-Signature=05fb857095296436e35887b2ad5ba1f3ddd5add54d5da2cea48ca037a8334f43&X-Amz-SignedHeaders=host&x-id=GetObject',
        },
      },
    },
  })
  async getProfile(@CurrentUser() userId: bigint) {
    return this.authService.getProfile(userId);
  }

  @Put('information')
  @ApiOperation({ summary: '정보 수정' })
  @ApiBadRequestResponse({
    example: {
      message: ERROR_CODE.ALREADY_USED_EMAIL,
    },
  })
  @ApiBearerAuth()
  async updateInformation(
    @CurrentUser() userId: bigint,
    @Body() body: UpdateInfoDto,
  ) {
    await this.authService.updateUser(userId, body.data);
    await this.authService.createUserVerificationDocument(
      userId,
      body.data.passportImageKey,
      body.data.profileImageKey,
    );
    return {
      result: 'Updated',
    };
  }

  @Public()
  @Post('delete-user')
  @ApiOperation({ summary: '회원 삭제' })
  async deleteUser(@Body() body: DeleteUserDto) {
    return this.authService.deleteUser(body.data.email);
  }

  @Get('qr-code')
  @ApiOperation({ summary: 'QR 코드 조회' })
  @ApiResponse({
    example: {
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAOiSURBVO3BQY5bCRYDweSD7n/lHC96wdUHBKncbQ8j4i/M/OOYKcdMOWbKMVOOmXLMlGOmHDPlmCnHTDlmyjFTjplyzJRjprz4UBJ+J5UnSXii0pLwCZUnSfidVD5xzJRjphwz5cWXqXxTEj6h0pLQVFoS3pGEpvJE5ZuS8E3HTDlmyjFTXvywJLxD5R1JaCpPVFoSnqi0JDSVTyThHSo/6Zgpx0w5ZsqLv1wSnqg8ScL/k2OmHDPlmCkv/jJJaCotCS0JTaWptCS0JDSVP9kxU46ZcsyUFz9M5d+UhCcq71D5JpX/kmOmHDPlmCkvviwJ/yaVloSm0pLQVFoSmkpLQlN5koT/smOmHDPlmCkvPqTyX5KEptKS8Dup/EmOmXLMlGOmxF/4QBKaSkvCN6m8IwlN5XdKwjep/KRjphwz5ZgpLz6k8gmVloSm8iQJTaWptCQ0lZaEd6i0JDSVb0pCU/mmY6YcM+WYKS++LAlPVJ6otCQ8UXmShJ+UhKbyjiQ0lXckoal84pgpx0w5Zkr8hQ8koak8ScI7VFoSPqHSkvBEpSXhicqf7Jgpx0w5Zkr8hS9KwhOVJ0l4ovKOJLxDpSWhqbQkNJWWhKbSktBUWhKaSktCU/nEMVOOmXLMlBcfSsITlSdJeKLyJAlN5YnKO1Q+ofJEpSWhqTxR+aZjphwz5ZgpL75MpSWhqTxRaUloKu9QaUl4ovIkCU3lSRKayhOVloSm0pLQVD5xzJRjphwz5cUPU2lJaCpPVH6SypMkNJV3qLQkNJUnKi0JTeWbjplyzJRjprz4YUn4RBKaSlNpSWgqn1BpSfimJLxD5ScdM+WYKcdMib/wB0tCU2lJaCotCd+k8o4kNJUnSWgq33TMlGOmHDPlxYeS8DupNJVPqLQkPFFpSXiShKbyTUloKp84ZsoxU46Z8uLLVL4pCU+S0FSaypMkPFFpSXiHyk9S+aZjphwz5ZgpL35YEt6h8okkPFF5otKS8I4kfFMSfqdjphwz5ZgpL/5yKk9Unqh8IglNpSWhJaGpPElCU/nEMVOOmXLMlBd/uSS8Q+UTSWgqLQlNpSWhJaGp/KRjphwz5ZgpL36Yyk9SaUloKi0JTeVJEppKS0JTaUl4h8q/6Zgpx0w5ZsqLL0vC75SEpvJNKi0JTaUl4YlKS8ITlZaEn3TMlGOmHDMl/sLMP46ZcsyUY6YcM+WYKcdMOWbKMVOOmXLMlGOmHDPlmCnHTDlmyv8Asxu/4vJPDAAAAAAASUVORK5CYII=',
    },
  })
  @ApiBearerAuth()
  async getQrCode(@CurrentUser() userId: bigint) {
    return this.authService.getQrCode(userId);
  }

  @Public()
  @Post('reset-password/request')
  @ApiOperation({ summary: '비밀번호 재설정 코드 이메일 발송' })
  async requestResetPassword(@Body() body: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(body.data.email, true);
  }

  @Public()
  @Post('reset-password/confirm')
  @ApiOperation({ summary: '비밀번호 재설정 코드 입력' })
  async confirmResetPassword(@Body() body: ConfirmEmailVerificationDto) {
    return this.authService.confirmEmailVerification(
      body.data.email,
      body.data.uuid,
      body.data.code,
    );
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정' })
  async resetPassword(@Body() body: ResetPaswordDto) {
    return this.authService.resetPassword(body.data.uuid, body.data.password);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh Token' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: RefreshTokenDto,
  ) {
    // const refreshToken = req.cookies['refresh_token'];
    const refreshToken = body.data.refreshToken;
    const {
      accessToken,
      refreshToken: newRefreshToken,
      userId,
    } = await this.authService.refeshAccessToken(refreshToken);

    // await this.authService.createSession(userId, newRefreshToken);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      expires: addDays(new Date(), 1),
      sameSite: 'none',
      domain:
        req.hostname === 'localhost' ?
          undefined
        : this.envService.get('COOKIE_DOMAIN'),
      secure: true,
    });
    // res.cookie('refresh_token', newRefreshToken, {
    //   httpOnly: true,
    //   expires: addYears(new Date(), 1),
    //   sameSite: 'none',
    //   domain:
    //     req.hostname === 'localhost' ?
    //       undefined
    //     : this.envService.get('COOKIE_DOMAIN'),
    //   secure: true,
    // });
    return { accessToken };
  }

  @Get('protected')
  @ApiBearerAuth()
  async protected() {
    return 'This is a protected route';
  }
}
