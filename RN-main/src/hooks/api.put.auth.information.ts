import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseInformation } from '~/types/http.response.information';
import { HttpResponse } from '~/types/http.response';

export function useApiPutAuthInformation() {
  const { put } = useHttp();

  const apiPutAuthInformation = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseInformation> = await put('/v1/auth/information', params);

    return !!response?.data?.result;
  }, []);

  return {
    apiPutAuthInformation,
  };
}

interface Params {
  name: string;
  birthday: string;
  countryCode: string;
  cityId: string;
  passportNumber: string;
  passportImageKey: string;
  profileImageKey: string;
}
