import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseResetPassword } from '~/types/http.response.reset.password';
import { HttpResponse } from '~/types/http.response';

export function useApiPostResetPassword() {
  const { post } = useHttp();

  const apiPostResetPassword = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseResetPassword> = await post('/v1/auth/reset-password', params);

    return !!response?.data?.id;
  }, []);

  return {
    apiPostResetPassword,
  };
}

interface Params {
  uuid: string;
  password: string;
  passwordCheck: string;
}
