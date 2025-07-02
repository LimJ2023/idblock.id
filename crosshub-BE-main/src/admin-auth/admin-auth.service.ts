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
import { BaseAuthService } from 'src/auth/base-auth.service';

@Injectable()
export class AdminAuthService extends BaseAuthService<
  typeof AdminUser.$inferSelect,
  typeof AdminUserSession.$inferSelect,
  TAdminLoginDto
> {
  constructor(
    @Inject(INJECT_DRIZZLE) db: DrizzleDB,
    jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super(
      db,
      jwtService,
      'AdminUser',
      'AdminUserSession',
      AdminUser,
      AdminUserSession,
      'adminUserId',
      '1h', // accessToken 만료시간
      '1d', // refreshToken 만료시간
    );
  }

  protected convertUserId(userId: string | number | bigint): number {
    return Number(userId);
  }

  protected getAdditionalLoginData(user: any): object {
    return {
      permission: user.permission,
    };
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

    return admins.map((admin) => ({
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
        throw new BadRequestException(
          '마지막 루트 관리자는 삭제할 수 없습니다.',
        );
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



  async argosRecognition(file: Express.Multer.File) {
    return this.authService.argosRecognition(file);
  }
}
