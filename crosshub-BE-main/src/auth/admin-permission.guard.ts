import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { AdminPermission } from 'src/database/schema/admin-user';
import { ADMIN_PERMISSION_KEY } from './admin-permission.decorator';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<AdminPermission>(
      ADMIN_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true; // 권한 요구사항이 없으면 통과
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    // 현재 사용자의 권한 정보 조회
    const adminUser = await this.db.query.AdminUser.findFirst({
      where: (users, { eq }) => eq(users.id, user.user_id),
    });

    if (!adminUser) {
      throw new ForbiddenException('관리자 권한이 없습니다.');
    }

    // 권한 체크: 낮은 숫자가 더 높은 권한 (1=ROOT, 2=MIDDLE, 3=GENERAL)
    if (adminUser.permission > requiredPermission) {
      throw new ForbiddenException(
        `이 기능은 ${this.getPermissionName(requiredPermission)} 이상의 권한이 필요합니다.`,
      );
    }

    return true;
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
} 