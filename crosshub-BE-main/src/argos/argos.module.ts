import { Module } from '@nestjs/common';
import { ArgosService } from './argos.service';
import { EnvModule } from 'src/env/env.module';
import { S3Module } from 'src/s3/s3.module';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [EnvModule, S3Module, DatabaseModule],
  providers: [ArgosService],
  exports: [ArgosService],
})
export class ArgosModule {}
 