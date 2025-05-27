import { Provider, Scope } from '@nestjs/common';
import { EnvService } from 'src/env/env.service';
import { createThirdwebClient } from 'thirdweb';

export const INJECT_THRIDWEB = Symbol('INJECT_THRIDWEB');
export const ThirdwebProvider = {
  provide: INJECT_THRIDWEB,
  useFactory: async (envService: EnvService) => {
    const secretKey = envService.get('THIRDWEB_SECRET', {
      infer: true,
    });

    return createThirdwebClient({
      secretKey,
    });
  },
  inject: [EnvService],
  scope: Scope.DEFAULT,
} as Provider;
