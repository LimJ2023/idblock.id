import { Module } from '@nestjs/common';
import { ManagerAuthController } from './manager-auth.controller';
import { ManagerAuthService } from './manager-auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { TEnv } from 'src/env/env.schema';

@Module({
  imports: [DatabaseModule],
  controllers:
    (process.env as unknown as TEnv).API_SCOPE === 'MANAGER' ?
      [ManagerAuthController]
    : [],
  providers: [ManagerAuthService],
  exports: [ManagerAuthService],
})
export class ManagerAuthModule {}
