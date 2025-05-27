import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseSignin } from '~/types/http.response.signin';
import { HttpResponse } from '~/types/http.response';

export function useApiPostAuthSignin() {
  const { post } = useHttp();

  const apiPostAuthSignin = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseSignin> = await post('/v1/auth/login', params);

    return (
      response?.data || {
        accessToken: '',
        refreshToken: '',
      }
    );
  }, []);

  return {
    apiPostAuthSignin,
  };
}

interface Params {
  email: string;
  password: string;
}
