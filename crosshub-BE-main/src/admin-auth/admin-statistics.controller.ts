import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminPermissionGuard } from 'src/auth/admin-permission.guard';
import { RequireAdminPermission } from 'src/auth/admin-permission.decorator';
import { AdminPermission } from 'src/database/schema/admin-user';
import { AdminStatisticsService } from 'src/admin-auth/admin-statistics.service';

@ApiTags('시스템 통계 (루트 관리자 전용)')
@Controller('admin-statistics')
@ApiBearerAuth()
@UseGuards(AdminPermissionGuard)
export class AdminStatisticsController {
  constructor(private readonly adminStatisticsService: AdminStatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ 
    summary: '대시보드 통계',
    description: '전체 시스템의 주요 통계를 조회합니다. (루트 관리자만 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async getDashboardStats() {
    return this.adminStatisticsService.getDashboardStats();
  }

  @Get('user-stats')
  @ApiOperation({ 
    summary: '사용자 통계',
    description: '사용자 관련 상세 통계를 조회합니다. (루트 관리자만 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async getUserStats() {
    return this.adminStatisticsService.getUserStats();
  }

  @Get('site-stats')
  @ApiOperation({ 
    summary: '관광지 통계',
    description: '관광지 관련 상세 통계를 조회합니다. (루트 관리자만 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async getSiteStats() {
    return this.adminStatisticsService.getSiteStats();
  }

  @Get('admin-activity')
  @ApiOperation({ 
    summary: '관리자 활동 로그',
    description: '관리자들의 활동 로그를 조회합니다. (루트 관리자만 접근 가능)'
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async getAdminActivity() {
    return this.adminStatisticsService.getAdminActivity();
  }
} 