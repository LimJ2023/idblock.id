import { SESClient } from '@aws-sdk/client-ses';
import { Provider, Scope } from '@nestjs/common';
import { Resend } from 'resend';
import { EnvService } from 'src/env/env.service';

export const INJECT_SES = Symbol('INJECT_SES');
export const SesProvider = {
  provide: INJECT_SES,
  useFactory: async (envService: EnvService) => {
    return new SESClient({ region: envService.get('S3_REGION') });
  },
  inject: [EnvService],
  scope: Scope.DEFAULT,
} as Provider;
