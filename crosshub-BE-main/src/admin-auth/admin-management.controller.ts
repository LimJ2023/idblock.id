import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from 'src/admin-auth/admin-auth.service';
import { AdminPermissionGuard } from 'src/auth/admin-permission.guard';
import { RequireAdminPermission } from 'src/auth/admin-permission.decorator';
import { AdminPermission } from 'src/database/schema/admin-user';
import {
  CreateAdminDto,
  UpdateAdminPermissionDto,
} from 'src/admin-auth/admin-management.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@ApiTags('관리자 관리')
@Controller('admin-management')
@ApiBearerAuth()
@UseGuards(AdminPermissionGuard)
export class AdminManagementController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Get('list')
  @ApiOperation({
    summary: '관리자 목록 조회',
    description:
      '모든 관리자의 목록을 조회합니다. (중간 관리자 이상 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.MIDDLE)
  async getAdminList() {
    return this.adminAuthService.getAdminList();
  }

  @Get('profile')
  @ApiOperation({
    summary: '내 프로필 조회',
    description: '현재 로그인한 관리자의 프로필을 조회합니다.',
  })
  async getMyProfile(@CurrentUser() userId: number) {
    return this.adminAuthService.getAdminProfile(userId);
  }

  @Post('create')
  @ApiOperation({
    summary: '새 관리자 생성',
    description: '새로운 관리자를 생성합니다. (루트 관리자만 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async createAdmin(@Body() body: CreateAdminDto) {
    return this.adminAuthService.createAdmin(body.data);
  }

  @Patch(':id/permission')
  @ApiOperation({
    summary: '관리자 권한 변경',
    description: '관리자의 권한을 변경합니다. (루트 관리자만 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async updateAdminPermission(
    @Param('id') id: number,
    @Body() body: UpdateAdminPermissionDto,
  ) {
    return this.adminAuthService.updateAdminPermission(
      id,
      body.data.permission,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: '관리자 삭제',
    description: '관리자를 삭제합니다. (루트 관리자만 접근 가능)',
  })
  @RequireAdminPermission(AdminPermission.ROOT)
  async deleteAdmin(@Param('id') id: number) {
    return this.adminAuthService.deleteAdmin(id);
  }
}
