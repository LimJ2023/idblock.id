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
import postgres from 'postgres';

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
    const client = postgres(configService.get<string>('DATABASE_URL'), {
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    
    const db = drizzle(client, {
      schema,
    });

    return db;
  },
  inject: [EnvService],
};
