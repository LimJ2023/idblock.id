import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';

export const INJECT_S3_CLIENT = Symbol('INJECT_S3_CLIENT');

export const S3ClientProvider = {
  provide: INJECT_S3_CLIENT,
  useFactory: async (envService: EnvService) => {
    return new S3Client({
      credentials: {
        accessKeyId: envService.get('ACCESS_KEY'),
        secretAccessKey: envService.get('SECRET_ACCESS_KEY'),
      },
      region: envService.get('S3_REGION'),
    });
  },
  inject: [EnvService],
} as Provider;
