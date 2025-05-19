import { Module } from '@nestjs/common';
import { GcsClientProvider } from './gcs-client.provider';
import { GcsService } from './gcs.service';


@Module({
    providers: [GcsService, GcsClientProvider],
    exports: [GcsService],
  })
  export class GcsModule {}
  