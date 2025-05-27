import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { INJECT_DRIZZLE } from './database/drizzle.provider';

@Injectable()
export class AppService {
  constructor(@Inject(INJECT_DRIZZLE) private db: PostgresJsDatabase) {}

  async getHello() {
    return 'Hello World!';
  }
}
