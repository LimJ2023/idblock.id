import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseMailConfirm } from '~/types/http.response.mail.confirm';
import { HttpResponse } from '~/types/http.response';

export function useApiPostResetConfirm() {
  const { post } = useHttp();

  const apiPostResetConfirm = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseMailConfirm> = await post('/v1/auth/reset-password/confirm', params);

    return response?.data || {};
  }, []);

  return {
    apiPostResetConfirm,
  };
}

interface Params {
  email: string;
  uuid: string;
  code: string;
}
