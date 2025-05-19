import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseMailVerify } from '~/types/http.response.mail.verify';
import { HttpResponse } from '~/types/http.response';

export function useApiPostMailVerify() {
  const { post } = useHttp();

  const apiPostMailVerify = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseMailVerify> = await post('/v1/auth/verify-email/request', params);

    return response?.data || {};
  }, []);

  return {
    apiPostMailVerify,
  };
}

interface Params {
  email: string;
}
