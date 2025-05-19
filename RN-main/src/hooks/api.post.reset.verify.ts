import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseMailVerify } from '~/types/http.response.mail.verify';
import { HttpResponse } from '~/types/http.response';

export function useApiPostResetVerify() {
  const { post } = useHttp();

  const apiPostResetVerify = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseMailVerify> = await post('/v1/auth/reset-password/request', params);

    return response?.data || {};
  }, []);

  return {
    apiPostResetVerify,
  };
}

interface Params {
  email: string;
}
