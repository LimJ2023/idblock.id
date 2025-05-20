import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { TAdminLoginDto } from './admin-auth.dto';
import { hash, verify } from '@node-rs/argon2';
import { AdminUser } from 'src/database/schema';
import { AdminUserSession } from 'src/database/schema/admin-user-session';
import { eq } from 'drizzle-orm';
import { ERROR_CODE } from 'src/common/error-code';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async login(body: TAdminLoginDto) {
    const target = await this.db.query.AdminUser.findFirst({
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

  async createSession(adminUserId: number, refreshToken: string) {
    return this.db
      .insert(AdminUserSession)
      .values({ adminUserId, refreshToken })
      .onConflictDoUpdate({
        target: AdminUserSession.adminUserId,
        set: { refreshToken, updatedAt: new Date() },
      })
      .returning({ id: AdminUserSession.id });
  }

  async deleteSession(adminUserId: string) {
    this.db
      .delete(AdminUserSession)
      .where(eq(AdminUserSession.adminUserId, parseInt(adminUserId)));
  }

  async createUser(data: typeof AdminUser.$inferInsert) {
    return this.db.insert(AdminUser).values({
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
  private createAccessToken(email: string, userId: number) {
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

  async argosRecognition(file: Express.Multer.File) {
    return this.authService.argosRecognition(file);
  }
}
