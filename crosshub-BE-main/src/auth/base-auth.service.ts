import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from '@node-rs/argon2';
import { DrizzleDB } from 'src/database/drizzle.provider';
import { ERROR_CODE } from 'src/common/error-code';
import { eq } from 'drizzle-orm';

export interface BaseLoginDto {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export abstract class BaseAuthService<
  TUser extends { id: any; email: string; password?: string },
  TSession extends { id: any; refreshToken: string },
  TLoginDto extends BaseLoginDto = BaseLoginDto
> {
  constructor(
    protected readonly db: DrizzleDB,
    protected readonly jwtService: JwtService,
    protected readonly userTableName: string,
    protected readonly sessionTableName: string,
    protected readonly userTable: any,
    protected readonly sessionTable: any,
    protected readonly sessionUserIdField: string,
    protected readonly accessTokenExpiry: string = '1d',
    protected readonly refreshTokenExpiry: string = '1y',
  ) {}

  async login(body: TLoginDto) {
    const target = await this.db.query[this.userTableName].findFirst({
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

    const userId = target.id;

    return {
      ...this.createAccessToken(target.email, userId),
      userId,
      ...this.getAdditionalLoginData(target),
    };
  }

  async createSession(userId: any, refreshToken: string) {
    const sessionData = {
      [this.sessionUserIdField]: userId,
      refreshToken,
    };

    return this.db
      .insert(this.sessionTable)
      .values(sessionData)
      .onConflictDoUpdate({
        target: this.sessionTable[this.sessionUserIdField],
        set: { refreshToken, updatedAt: new Date() },
      })
      .returning({ id: this.sessionTable.id });
  }

  async deleteSession(userId: string | number | bigint) {
    const convertedUserId = this.convertUserId(userId);
    return this.db
      .delete(this.sessionTable)
      .where(eq(this.sessionTable[this.sessionUserIdField], convertedUserId));
  }

  async createUser(data: any) {
    return this.db.insert(this.userTable).values({
      ...data,
      password: await this.hashPassword(data.password as string),
    });
  }

  async refeshAccessToken(refreshToken: string) {
    const target = await this.db.query[this.sessionTableName].findFirst({
      where: (table, { eq }) => eq(table.refreshToken, refreshToken),
    });

    const verified = await this.validateRefreshToken(refreshToken);

    if (!target || !verified) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_REFRESH_TOKEN);
    }

    const userId = target[this.sessionUserIdField];

    const user = await this.db.query[this.userTableName].findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });

    return {
      ...this.createAccessToken(user?.email as string, userId),
      userId,
    };
  }

  protected async validateRefreshToken(refreshToken: string): Promise<boolean> {
    if (!refreshToken) {
      throw new BadRequestException(ERROR_CODE.INVALID_REFRESH_TOKEN);
    }
    try {
      await this.jwtService.verifyAsync(refreshToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  protected hashPassword(password: string): Promise<string> {
    return hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  protected createAccessToken(email: string, userId: any): TokenResponse {
    return {
      accessToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: this.accessTokenExpiry },
      ),
      refreshToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: this.refreshTokenExpiry },
      ),
    };
  }

  // 각 서비스에서 userId 타입에 맞게 변환하는 메소드
  protected abstract convertUserId(userId: string | number | bigint): any;

  // 로그인 시 추가 데이터를 반환하고 싶은 경우 오버라이드
  protected getAdditionalLoginData(user: any): object {
    return {};
  }
} 