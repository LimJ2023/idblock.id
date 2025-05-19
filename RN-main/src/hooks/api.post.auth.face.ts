import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';
import { HttpResponseFileUpload } from '~/types/http.response.file.upload';

export function useApiPostAuthFace() {
  const { postForm } = useHttp();

  const apiPostAuthFace = useCallback(async ({ formData }: Params) => {
    const response: HttpResponse<HttpResponseFileUpload> = await postForm('/v1/auth/upload/profile-image', formData);

    return (
      response.data || {
        key: '',
        uri: '',
      }
    );
  }, []);

  return {
    apiPostAuthFace,
  };
}

interface Params {
  formData: FormData;
}
