import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseVerifyPassport } from '~/types/http.response.verify.passport';
import { HttpResponse } from '~/types/http.response';

export function useApiPostVerifyPassport() {
  const { post } = useHttp();

  const apiPostVerifyPassport = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseVerifyPassport> = await post('/v1/auth/sign-up/verify-step1', params);

    if (response.data?.passportNumber) {
      return true;
    }

    return false;
  }, []);

  return {
    apiPostVerifyPassport,
  };
}

interface Params {
  birthday: string;
  passportNumber: string;
}
