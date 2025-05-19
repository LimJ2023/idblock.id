import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { EmailModule } from 'src/email/email.module';
import { S3Module } from 'src/s3/s3.module';

@Global()
@Module({
  imports: [DatabaseModule, EmailModule, S3Module],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
