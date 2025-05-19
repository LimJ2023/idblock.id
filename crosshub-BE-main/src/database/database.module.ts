import { Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';

@Module({
  imports: [],
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DatabaseModule {}
