import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { TAdminLoginDto } from './admin-auth.dto';
import { hash, verify } from '@node-rs/argon2';
import { AdminUser, AdminPermission } from 'src/database/schema';
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

  // 관리자 관리 메서드들
  async getAdminList() {
    const admins = await this.db.query.AdminUser.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        permission: true,
      },
    });

    return admins.map(admin => ({
      ...admin,
      permissionName: this.getPermissionName(admin.permission),
    }));
  }

  async getAdminProfile(userId: number) {
    const admin = await this.db.query.AdminUser.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        permission: true,
      },
    });

    if (!admin) {
      throw new BadRequestException('관리자를 찾을 수 없습니다.');
    }

    return {
      ...admin,
      permissionName: this.getPermissionName(admin.permission),
    };
  }

  async createAdmin(data: {
    email: string;
    password: string;
    name: string;
    permission: AdminPermission;
  }) {
    const existingAdmin = await this.db.query.AdminUser.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });

    if (existingAdmin) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const [newAdmin] = await this.db
      .insert(AdminUser)
      .values({
        ...data,
        password: await this.hashPassword(data.password),
      })
      .returning({
        id: AdminUser.id,
        email: AdminUser.email,
        name: AdminUser.name,
        permission: AdminUser.permission,
      });

    return {
      ...newAdmin,
      permissionName: this.getPermissionName(newAdmin.permission),
    };
  }

  async updateAdminPermission(adminId: number, permission: AdminPermission) {
    const [updatedAdmin] = await this.db
      .update(AdminUser)
      .set({ permission })
      .where(eq(AdminUser.id, adminId))
      .returning({
        id: AdminUser.id,
        email: AdminUser.email,
        name: AdminUser.name,
        permission: AdminUser.permission,
      });

    if (!updatedAdmin) {
      throw new BadRequestException('관리자를 찾을 수 없습니다.');
    }

    return {
      ...updatedAdmin,
      permissionName: this.getPermissionName(updatedAdmin.permission),
    };
  }

  async deleteAdmin(adminId: number) {
    const adminToDelete = await this.db.query.AdminUser.findFirst({
      where: (users, { eq }) => eq(users.id, adminId),
    });

    if (!adminToDelete) {
      throw new BadRequestException('관리자를 찾을 수 없습니다.');
    }

    if (adminToDelete.permission === AdminPermission.ROOT) {
      // 루트 관리자가 한 명뿐인지 확인
      const rootAdmins = await this.db.query.AdminUser.findMany({
        where: (users, { eq }) => eq(users.permission, AdminPermission.ROOT),
      });

      if (rootAdmins.length <= 1) {
        throw new BadRequestException('마지막 루트 관리자는 삭제할 수 없습니다.');
      }
    }

    await this.db.delete(AdminUser).where(eq(AdminUser.id, adminId));
    return { message: '관리자가 삭제되었습니다.' };
  }

  private getPermissionName(permission: AdminPermission): string {
    switch (permission) {
      case AdminPermission.ROOT:
        return '루트 관리자';
      case AdminPermission.MIDDLE:
        return '중간 관리자';
      case AdminPermission.GENERAL:
        return '일반 관리자';
      default:
        return '알 수 없는 권한';
    }
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
