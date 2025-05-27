import { Provider, Scope } from '@nestjs/common';
import { Resend } from 'resend';
import { EnvService } from 'src/env/env.service';

export const INJECT_RESEND = Symbol('INJECT_RESEND');
export const ResendProvider = {
  provide: INJECT_RESEND,
  useFactory: async (envService: EnvService) => {
    const resendApiKey = envService.get('RESEND_API_KEY', {
      infer: true,
    });

    return new Resend(resendApiKey);
  },
  inject: [EnvService],
  scope: Scope.DEFAULT,
} as Provider;
