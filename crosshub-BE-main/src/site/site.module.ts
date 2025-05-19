import { Module } from '@nestjs/common';
import { TEnv } from 'src/env/env.schema';
import { PublicSiteController } from './public.site.controller';
import { AdminSiteController } from './admin.site.controller';
import { ManagerSiteController } from './manager.site.controller';
import { SiteService } from './site.service';
import { DatabaseModule } from 'src/database/database.module';
import { S3Module } from 'src/s3/s3.module';
import { ManagerAuthModule } from 'src/manager-auth/manager-auth.module';

@Module({
  imports: [DatabaseModule, S3Module, ManagerAuthModule],
  controllers:
    (process.env as unknown as TEnv).API_SCOPE === 'PUBLIC' ?
      [PublicSiteController]
    : (process.env as unknown as TEnv).API_SCOPE === 'ADMIN' ?
      [AdminSiteController]
    : (process.env as unknown as TEnv).API_SCOPE === 'MANAGER' ?
      [ManagerSiteController]
    : [],
  providers: [SiteService],
})
export class SiteModule {}
