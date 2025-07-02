import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { TManagerLoginDto } from './manager-auth.dto';
import { hash, verify } from '@node-rs/argon2';
import { SiteManager, SiteManagerSession } from 'src/database/schema';
import { eq } from 'drizzle-orm';
import { ERROR_CODE } from 'src/common/error-code';
import { BaseAuthService } from 'src/auth/base-auth.service';

@Injectable()
export class ManagerAuthService extends BaseAuthService<
  typeof SiteManager.$inferSelect,
  typeof SiteManagerSession.$inferSelect,
  TManagerLoginDto
> {
  constructor(
    @Inject(INJECT_DRIZZLE) db: DrizzleDB,
    jwtService: JwtService,
  ) {
    super(
      db,
      jwtService,
      'SiteManager',
      'SiteManagerSession',
      SiteManager,
      SiteManagerSession,
      'siteManagerId',
      '1h', // accessToken 만료시간
      '1d', // refreshToken 만료시간
    );
  }

  protected convertUserId(userId: string | number | bigint): bigint {
    return BigInt(userId);
  }


}
