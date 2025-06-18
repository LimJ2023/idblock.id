import { Module } from '@nestjs/common';
import { AdminUserController } from './admin.user.controller';
import { UserService } from './user.service';
import { TEnv } from 'src/env/env.schema';
import { DatabaseModule } from 'src/database/database.module';
import { S3Module } from 'src/s3/s3.module';
import { ThirdwebModule } from 'src/thirdweb/thirdweb.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ArgosModule } from 'src/argos/argos.module';

@Module({
  imports: [DatabaseModule, S3Module, ThirdwebModule, NotificationModule, ArgosModule],
  controllers:
    (process.env as unknown as TEnv).API_SCOPE === 'ADMIN' ?
      [AdminUserController]
    : [],
  providers: [UserService],
})
export class UserModule {}
