import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminManagementController } from './admin-management.controller';
import { AdminStatisticsController } from './admin-statistics.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AdminAuthService } from './admin-auth.service';
import { AdminStatisticsService } from './admin-statistics.service';
import { AuthModule } from 'src/auth/auth.module';
import { AdminPermissionGuard } from 'src/auth/admin-permission.guard';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminAuthController, AdminManagementController, AdminStatisticsController],
  providers: [AdminAuthService, AdminStatisticsService, AdminPermissionGuard],
  exports: [AdminAuthService, AdminPermissionGuard],
})
export class AdminAuthModule {}
