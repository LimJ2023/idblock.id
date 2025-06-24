import { Module } from '@nestjs/common';
import { BlockTxController } from './block-tx.controller';
import { BlockTxService } from './block-tx.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BlockTxController],
  providers: [BlockTxService],
  exports: [BlockTxService],
})
export class BlockTxModule {} 