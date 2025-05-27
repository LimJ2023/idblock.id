import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import { EnvService } from 'src/env/env.service';

export const INJECT_MARIA_ESL = Symbol('INJECT_MARIA_ESL');

export const TmpEslMariaDrizzleProvider: Provider = {
  provide: INJECT_MARIA_ESL,
  useFactory: async (configService: EnvService) => {
    const db = drizzle(configService.get<string>('TMP_MARIA_URL'), {
      logger: true,
    });
    return db;
  },
  inject: [EnvService],
};
