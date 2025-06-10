import { Body, Controller, Delete, Get, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/auth/auth.guard';
import * as v from 'valibot';
import { AdminLoginDto, AdminSignUpDto } from './admin-auth.dto';
import { Request, Response } from 'express';
import { insertAdminUserSchema } from 'src/database/schema';
import { AdminAuthService } from './admin-auth.service';
import { EnvService } from 'src/env/env.service';
import { addDays, addHours } from 'date-fns';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from 'src/s3/s3.dto';

@ApiTags('관리자 인증')
@Controller('admin-auth')
export class AdminAuthController {
  constructor(
    private readonly authService: AdminAuthService,
    private readonly envService: EnvService,
  ) {}
  @Post('login')
  @Public()
  async login(
    @Req() req: Request,
    @Body() body: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } = await this.authService.login(
      body.data,
    );
    await this.authService.createSession(userId, refreshToken);
    
    const cookieDomain = this.envService.get('COOKIE_DOMAIN');
    const domain = req.hostname === 'localhost' || !cookieDomain || cookieDomain.trim() === '' 
      ? undefined 
      : cookieDomain;
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      domain,
      secure: true,
      expires: addHours(new Date(), 1),
      path: '/',
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      domain,
      secure: true,
      expires: addDays(new Date(), 1),
      path: '/',
    });
    return { accessToken, refreshToken };
  }

  @Delete('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() userId: string,
  ) {
    await this.authService.deleteSession(userId);
    
    const cookieDomain = this.envService.get('COOKIE_DOMAIN');
    const domain = req.hostname === 'localhost' || !cookieDomain || cookieDomain.trim() === '' 
      ? undefined 
      : cookieDomain;
    
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      domain,
      secure: true,
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'none',
      domain,
      secure: true,
      path: '/',
    });

    return 'Logged out';
  }

  @Post('test-signup')
  @Public()
  async testSignup(@Body() body: AdminSignUpDto) {
    return this.authService.createUser(
      v.parse(insertAdminUserSchema, body.data, {}),
    );
  }



  @Get('protected')
  async protected() {
    return 'This is a protected route';
  }
}
