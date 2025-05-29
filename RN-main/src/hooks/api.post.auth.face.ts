import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';
import { HttpResponseFileUpload } from '~/types/http.response.file.upload';

export function useApiPostAuthFace() {
  const { postForm } = useHttp();

  const apiPostAuthFace = useCallback(async ({ formData }: Params) => {
    try {
      console.log('face upload start:', formData);
      const response: HttpResponse<HttpResponseFileUpload> = await postForm('/v1/auth/upload/profile-image', formData);
      console.log('face upload response:', response);
      
      return (
        response.data || {
          key: '',
          uri: '',
        }
      );
    } catch (error) {
      console.log('face upload error:', error);
      throw error;
    }
  }, []);

  return {
    apiPostAuthFace,
  };
}

interface Params {
  formData: FormData;
}
