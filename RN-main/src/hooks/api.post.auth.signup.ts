import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseSignup } from '~/types/http.response.signup';
import { HttpResponse } from '~/types/http.response';
import { HttpResponseSignupSimple } from '~/types/http.response.signup.simple';

export function useApiPostAuthSignup() {
  const { post } = useHttp();

  const apiPostAuthSignup = useCallback(async (params: Params) => {
    try {
      
      const response: HttpResponse<HttpResponseSignup> = await post('/v1/auth/sign-up', params);
      console.log('/v1/auth/sign-up response : ', response);
      
      const isSuccess = !!response?.data?.isAutoApproved;
      console.log('자동인증 요청 성공 여부:', isSuccess);
      
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

  const apiPostAuthAdditionalVerification = useCallback(async (params: Params) => {
    try {
      const response: HttpResponse<HttpResponseSignup> = await post('/v1/auth/additional-verification', params);
      console.log('/v1/auth/sign-up/additional-verification response : ', response);
      const isSuccess = !!response?.data?.isAutoApproved;
      console.log('자동인증 요청 성공 여부:', isSuccess);
      
      return isSuccess;
    } catch (error) {
      throw error;
    }
  }, []);


  const apiPostAuthSignupSimple = useCallback(async (params: ParamsSimple) => {

    try{
    const response: HttpResponse<HttpResponseSignupSimple> = await post('/v1/auth/sign-up/simple', params);

    return response?.data;
  } catch (error) {
    console.log('=== 회원가입 API 에러 ===');
    console.log('error:', error);
    console.log('error.code:', error?.code);
    console.log('error.message:', error?.message);
    console.log('error.response:', error?.response);
    throw error;
  }
  }, [])

  return {
    apiPostAuthSignup,
    apiPostAuthSignupSimple,
    apiPostAuthAdditionalVerification,
  };
}

interface Params {
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
interface ParamsSimple {
  email: string;
  password: string;
}