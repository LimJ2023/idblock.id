import { Module } from '@nestjs/common';
import { VisitorController } from './visitor.controller';
import { VisitorService } from './visitor.service';
import { DatabaseModule } from 'src/database/database.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [DatabaseModule, S3Module],
  controllers: [VisitorController],
  providers: [VisitorService],
})
export class VisitorModule {}
