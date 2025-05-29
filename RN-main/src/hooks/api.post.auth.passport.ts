import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';
import { HttpResponseFileUpload } from '~/types/http.response.file.upload';

export function useApiPostAuthPassport() {
  const { postForm } = useHttp();

  const apiPostAuthPassport = useCallback(async ({ formData }: Params) => {
    try {
      console.log('passport upload start:', formData);
      const response: HttpResponse<HttpResponseFileUpload> = await postForm('/v1/auth/upload/passport-image', formData);
      console.log('passport upload response:', response);
      
      return (
        response.data || {
          key: '',
          uri: '',
        }
      );
    } catch (error) {
      console.log('passport upload error:', error);
      throw error;
    }
  }, []);

  return {
    apiPostAuthPassport,
  };
}

interface Params {
  formData: FormData;
}
