import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseSignup } from '~/types/http.response.signup';
import { HttpResponse } from '~/types/http.response';

export function useApiPostAuthSignup() {
  const { post } = useHttp();

  const apiPostAuthSignup = useCallback(async (params: Params) => {
    const response: HttpResponse<HttpResponseSignup> = await post('/v1/auth/sign-up', params);

    return !!response?.data?.id;
  }, []);

  return {
    apiPostAuthSignup,
  };
}

interface Params {
  uuid: string;
  email: string;
  password: string;
  passwordCheck: string;
  name: string;
  birthday: string;
  countryCode: string;
  cityId: string;
  passportNumber: string;
  passportImageKey: string;
  profileImageKey: string;
}
