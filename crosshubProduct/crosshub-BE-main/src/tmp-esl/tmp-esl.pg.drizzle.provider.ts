import { Provider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { EnvService } from 'src/env/env.service';

export const INJECT_PG_ESL = Symbol('INJECT_PG_ESL');

export const TmpEslPgDrizzleProvider: Provider = {
  provide: INJECT_PG_ESL,
  useFactory: async (configService: EnvService) => {
    const db = drizzle(configService.get<string>('TMP_PG_URL'), {
      logger: true,
    });
    return db;
  },
  inject: [EnvService],
};
