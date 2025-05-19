import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';

export function useApiGetQr() {
  const { get } = useHttp();

  const apiGetQr = useCallback(async () => {
    const response: HttpResponse<string> = await get('/v1/auth/qr-code');

    return response?.data || '';
  }, []);

  return {
    apiGetQr,
  };
}
