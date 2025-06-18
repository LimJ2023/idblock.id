import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/current-user.decorator';
import {
  ApproveUserDto,
  QueryUserDto,
  RejectUserDto,
  UserRecognitionDto,
  UserVerificationDocumetDetailDto,
} from './admin.user.dto';
import { FileUploadDto } from 'src/s3/s3.dto';
import { S3Service } from 'src/s3/s3.service';
import { AdminPermissionGuard } from 'src/auth/admin-permission.guard';
import { RequireAdminPermission } from 'src/auth/admin-permission.decorator';
import { AdminPermission } from 'src/database/schema/admin-user';
import { ArgosService } from 'src/argos/argos.service';

@ApiTags('회원 관리')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AdminPermissionGuard)
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly s3Service: S3Service,
    private readonly argosService: ArgosService,
  ) {}

  @Get('')
  @ApiOperation({
    summary: '회원 목록 조회',
    description: '모든 회원의 목록을 조회합니다. (일반 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.GENERAL)
  async listUsers(@Query() q: QueryUserDto) {
    return this.userService.listUsers(q.data.status);
  }

  @Get(':documentId')
  @ApiOperation({
    summary: '회원 상세 조회',
    description:
      '특정 회원의 상세 정보를 조회합니다. (일반 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.GENERAL)
  async getUser(@Param() param: UserVerificationDocumetDetailDto) {
    return this.userService.getUserVerificationDocument(param.data.documentId);
  }

  @Post('argos-id-liveness')
  @ApiOperation({
    summary: '회원 Argos ID Liveness',
    description:
      'Argos ID Liveness 검증을 수행합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async getArgosIdLiveness(@Body() body: UserVerificationDocumetDetailDto) {
    return await this.argosService.argosProcessPipeline(body.data.documentId);
  }

  @Post('argos-recognition')
  @ApiOperation({
    summary: '회원 Argos Recognition',
    description: 'Argos Recognition을 수행합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('이미지 파일만 업로드 가능합니다.'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드',
    type: FileUploadDto,
  })
  async getArgosRecognition(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }
    try {
      return await this.argosService.recognitionFromFile(file);
    } catch (error) {
      console.error('File upload error:', error);
      throw new BadRequestException('파일 업로드 중 오류가 발생했습니다.');
    }
  }

  @Post('approve')
  @ApiOperation({
    summary: '회원 승인',
    description: '회원 가입을 승인합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async approveUser(
    @CurrentUser() adminId: number,
    @Body() body: ApproveUserDto,
  ) {
    return await this.userService.approveUser(body.data.documentId, adminId);
  }

  @Patch('reject')
  @ApiOperation({
    summary: '회원 거부',
    description: '회원 가입을 거부합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async rejectUser(@Body() body: RejectUserDto) {
    return this.userService.declineUser(body.data.documentId, body.data.reason);
  }

  @Delete(':documentId')
  @ApiOperation({
    summary: '회원 삭제',
    description: '회원을 삭제합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async deleteUser(@Param() param: UserVerificationDocumetDetailDto) {
    return this.userService.deleteUser(param.data.documentId);
  }
}
