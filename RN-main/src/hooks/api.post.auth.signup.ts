import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseSignup } from '~/types/http.response.signup';
import { HttpResponse } from '~/types/http.response';

export function useApiPostAuthSignup() {
  const { post } = useHttp();

  const apiPostAuthSignup = useCallback(async (params: Params) => {
    try {
      console.log('=== 회원가입 API 요청 시작 ===');
      console.log('signup params:', {
        uuid: params.uuid,
        email: params.email,
        name: params.name,
        birthday: params.birthday,
        countryCode: params.countryCode,
        cityId: params.cityId,
        passportNumber: params.passportNumber,
        passportImageKey: params.passportImageKey,
        profileImageKey: params.profileImageKey,
        // password는 로그에 남기지 않음
      });
      
      const response: HttpResponse<HttpResponseSignup> = await post('/v1/auth/sign-up', params);
      console.log('/v1/auth/sign-up response : ', response);
      
      const isSuccess = !!response?.data?.id;
      console.log('회원가입 성공 여부:', isSuccess);
      
      return isSuccess;
    } catch (error) {
      console.log('=== 회원가입 API 에러 ===');
      console.log('error:', error);
      console.log('error.code:', error?.code);
      console.log('error.message:', error?.message);
      console.log('error.response:', error?.response);
      throw error;
    }
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
