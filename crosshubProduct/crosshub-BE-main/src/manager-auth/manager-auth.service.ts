import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { TManagerLoginDto } from './manager-auth.dto';
import { hash, verify } from '@node-rs/argon2';
import { SiteManager, SiteManagerSession } from 'src/database/schema';
import { eq } from 'drizzle-orm';
import { ERROR_CODE } from 'src/common/error-code';

@Injectable()
export class ManagerAuthService {
  constructor(
    @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
    private readonly jwtService: JwtService,
  ) {}

  async login(body: TManagerLoginDto) {
    const target = await this.db.query.SiteManager.findFirst({
      where: (users, { eq }) => eq(users.email, body.email),
    });

    if (!target) {
      throw new BadRequestException(ERROR_CODE.INVALID_LOGIN_DATA);
    }

    const isPasswordValid = await verify(
      target.password as string,
      body.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(ERROR_CODE.INVALID_LOGIN_DATA);
    }

    return {
      ...this.createAccessToken(target.email, target.id),
      userId: target.id,
    };
  }

  async createSession(siteManagerId: bigint, refreshToken: string) {
    return this.db
      .insert(SiteManagerSession)
      .values({ siteManagerId, refreshToken })
      .onConflictDoUpdate({
        target: SiteManagerSession.siteManagerId,
        set: { refreshToken, updatedAt: new Date() },
      })
      .returning({ id: SiteManagerSession.id });
  }

  async deleteSession(siteManagerId: string) {
    this.db
      .delete(SiteManagerSession)
      .where(eq(SiteManagerSession.siteManagerId, BigInt(siteManagerId)));
  }

  async createUser(data: typeof SiteManager.$inferInsert) {
    return this.db.insert(SiteManager).values({
      ...data,
      password: await this.hashPassword(data.password as string),
    });
  }

  private hashPassword(password: string) {
    return hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }
  private createAccessToken(email: string, userId: bigint) {
    return {
      accessToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: '1h' },
      ),
      refreshToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: '1d' },
      ),
    };
  }
}
