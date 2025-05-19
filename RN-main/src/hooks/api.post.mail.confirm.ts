import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseMailConfirm } from '~/types/http.response.mail.confirm';
import { HttpResponse } from '~/types/http.response';

export function useApiPostMailConfirm() {
  const { post } = useHttp();

  const apiPostMailConfirm = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseMailConfirm> = await post('/v1/auth/verify-email/confirm', params);

    return !!response?.data?.uuid;
  }, []);

  return {
    apiPostMailConfirm,
  };
}

interface Params {
  email: string;
  code: string;
  uuid: string;
}
