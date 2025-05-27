import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3ClientProvider } from './s3-client.provider';

@Module({
  controllers: [],
  providers: [S3Service, S3ClientProvider],
  exports: [S3Service],
})
export class S3Module {}
