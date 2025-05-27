import { Module } from '@nestjs/common';
import { ThirdwebService } from './thirdweb.service';
import { ThirdwebProvider } from './thirdweb.client.provider';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [S3Module],
  providers: [ThirdwebService, ThirdwebProvider],
  exports: [ThirdwebService],
})
export class ThirdwebModule {}
