import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AdminAuthService } from './admin-auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
