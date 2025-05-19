import { Storage } from '@google-cloud/storage';
import { Provider } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';

export const INJECT_GCS = Symbol('INJECT_GCS');

export const GcsClientProvider: Provider = {
  provide: INJECT_GCS,
  useFactory: async (env: EnvService) => {
    return new Storage({
      projectId: env.get('GCP_PROJECT_ID'),
      keyFilename: env.get('GOOGLE_APPLICATION_CREDENTIALS'),
    });
  },
  inject: [EnvService],
};
