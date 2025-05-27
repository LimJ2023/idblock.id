import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AdminAuthService } from './admin-auth.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
