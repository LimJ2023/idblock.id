import { Injectable, Inject } from '@nestjs/common';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { AdminUser, AdminPermission } from 'src/database/schema/admin-user';
import { User } from 'src/database/schema/user';
import { Site } from 'src/database/schema/site';
import { UserVerificationDocument } from 'src/database/schema/user-verification-document';
import { eq, count, desc } from 'drizzle-orm';

@Injectable()
export class AdminStatisticsService {
  constructor(@Inject(INJECT_DRIZZLE) private db: DrizzleDB) {}

  async getDashboardStats() {
    // 전체 통계를 병렬로 조회
    const [
      totalUsers,
      totalAdmins,
      totalSites,
      pendingApprovals,
      approvedUsers,
      rejectedUsers,
    ] = await Promise.all([
      this.db.select({ count: count() }).from(User),
      this.db.select({ count: count() }).from(AdminUser),
      this.db.select({ count: count() }).from(Site),
      this.db.select({ count: count() }).from(UserVerificationDocument).where(eq(UserVerificationDocument.approvalStatus, 0)), // 0 = PENDING
      this.db.select({ count: count() }).from(UserVerificationDocument).where(eq(UserVerificationDocument.approvalStatus, 1)), // 1 = APPROVED
      this.db.select({ count: count() }).from(UserVerificationDocument).where(eq(UserVerificationDocument.approvalStatus, 2)), // 2 = REJECTED
    ]);

    // 관리자 권한별 통계
    const adminsByPermission = await this.db
      .select({ 
        permission: AdminUser.permission,
        count: count()
      })
      .from(AdminUser)
      .groupBy(AdminUser.permission);

    const adminStats = {
      [AdminPermission.ROOT]: 0,
      [AdminPermission.MIDDLE]: 0,
      [AdminPermission.GENERAL]: 0,
    };

    adminsByPermission.forEach(stat => {
      adminStats[stat.permission] = stat.count;
    });

    return {
      summary: {
        totalUsers: totalUsers[0].count,
        totalAdmins: totalAdmins[0].count,
        totalSites: totalSites[0].count,
        pendingApprovals: pendingApprovals[0].count,
      },
      userApprovalStats: {
        approved: approvedUsers[0].count,
        rejected: rejectedUsers[0].count,
        pending: pendingApprovals[0].count,
      },
      adminStats: {
        root: adminStats[AdminPermission.ROOT],
        middle: adminStats[AdminPermission.MIDDLE],
        general: adminStats[AdminPermission.GENERAL],
      },
    };
  }

  async getUserStats() {
    // 최근 가입한 사용자들 (User 테이블에 createdAt이 없으므로 UserVerificationDocument의 createdAt 사용)
    const recentDocuments = await this.db.query.UserVerificationDocument.findMany({
      columns: {
        id: true,
        userId: true,
        createdAt: true,
        approvalStatus: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      limit: 10,
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
    });

    // 승인 대기 중인 사용자들
    const pendingApprovals = await this.db.query.UserVerificationDocument.findMany({
      where: (docs, { eq }) => eq(docs.approvalStatus, 0), // 0 = PENDING
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      limit: 10,
      orderBy: (docs, { desc }) => [desc(docs.createdAt)],
    });

    return {
      recentUsers: recentDocuments.map(doc => ({
        id: doc.user.id,
        email: doc.user.email,
        name: doc.user.name,
        createdAt: doc.createdAt,
        approvalStatus: doc.approvalStatus,
        approvalStatusName: this.getApprovalStatusName(doc.approvalStatus),
      })),
      pendingApprovals: pendingApprovals.map(doc => ({
        documentId: doc.id,
        user: doc.user,
        createdAt: doc.createdAt,
        approvalStatus: doc.approvalStatus,
      })),
    };
  }

  async getSiteStats() {
    // 관광지 통계 (Site 테이블에는 createdAt이 없으므로 id 순서로 정렬)
    const sites = await this.db.query.Site.findMany({
      columns: {
        id: true,
        name: true,
        address: true,
        description: true,
      },
      orderBy: (sites, { desc }) => [desc(sites.id)],
      limit: 10,
    });

    return {
      recentSites: sites,
    };
  }

  async getAdminActivity() {
    // 관리자 목록과 기본 정보
    const admins = await this.db.query.AdminUser.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        permission: true,
      },
    });

    const adminsWithPermissionName = admins.map(admin => ({
      ...admin,
      permissionName: this.getPermissionName(admin.permission),
    }));

    return {
      admins: adminsWithPermissionName,
    };
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

  private getApprovalStatusName(status: number): string {
    switch (status) {
      case 0:
        return '승인 대기';
      case 1:
        return '승인됨';
      case 2:
        return '거부됨';
      default:
        return '알 수 없는 상태';
    }
  }
} 