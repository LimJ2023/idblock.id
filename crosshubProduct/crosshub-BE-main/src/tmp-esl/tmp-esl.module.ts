import { Module } from '@nestjs/common';
import { TmpEslController } from './tmp-esl.controller';
import { TmpEslService } from './tmp-esl.service';
import { TmpEslPgDrizzleProvider } from './tmp-esl.pg.drizzle.provider';
import { TmpEslMariaDrizzleProvider } from './tmp-esl.maria.drizzle.provider';

@Module({
  controllers: [TmpEslController],
  providers: [
    TmpEslService,
    TmpEslPgDrizzleProvider,
    TmpEslMariaDrizzleProvider,
  ],
})
export class TmpEslModule {}
