import { Provider } from '@nestjs/common';
import {
  drizzle,
  PostgresJsDatabase,
  PostgresJsQueryResultHKT,
} from 'drizzle-orm/postgres-js';
import { EnvService } from 'src/env/env.service';
import * as schema from './schema';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';

export const INJECT_DRIZZLE = Symbol('INJECT_DRIZZLE');

export type DrizzleDB = PostgresJsDatabase<typeof schema>;
export type DrizzleTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export const DrizzleProvider: Provider = {
  provide: INJECT_DRIZZLE,
  useFactory: async (configService: EnvService) => {
    const db = drizzle(configService.get<string>('DATABASE_URL'), {
      schema,
    });

    return db;
  },
  inject: [EnvService],
};
