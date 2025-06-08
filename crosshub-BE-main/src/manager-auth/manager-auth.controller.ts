import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { ManagerAuthService } from './manager-auth.service';
import { EnvService } from 'src/env/env.service';
import { Public } from 'src/auth/auth.guard';
import { ManagerLoginDto, ManagerSignUpDto } from './manager-auth.dto';
import { Request, Response } from 'express';
import { addDays, addHours } from 'date-fns';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { insertSiteManagerSchema } from 'src/database/schema';
import * as v from 'valibot';

@Controller('manager-auth')
export class ManagerAuthController {
  constructor(
    private readonly authService: ManagerAuthService,
    private readonly envService: EnvService,
  ) {}
  @Post('login')
  @Public()
  async login(
    @Req() req: Request,
    @Body() body: ManagerLoginDto,
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
  async testSignup(@Body() body: ManagerSignUpDto) {
    return this.authService.createUser(
      v.parse(insertSiteManagerSchema, body.data, {}),
    );
  }

  @Get('protected')
  async protected() {
    return 'This is a protected route';
  }
}
