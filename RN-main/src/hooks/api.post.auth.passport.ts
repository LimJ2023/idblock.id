import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';

type PassportRecognitionResponse = {
  ocr_fullName: string;
  ocr_gender: string;
  ocr_birthDate: string;
  ocr_issueDate: string;
  ocr_expireDate: string;
  ocr_nationality: string;
  ocr_full_mrz: string;
  ocr_number: string;
}

export function useApiPostAuthPassport() {
  const { postForm } = useHttp();

  const apiPostAuthPassport = useCallback(async ({ formData }: Params) => {
    try {

      console.log("formData 전달받음: " + JSON.stringify(formData));
      const response: HttpResponse<PassportRecognitionResponse> = await postForm('/v1/auth/upload/passport-recognition', formData);
      console.log("response 서버 처리 결과 : " + JSON.stringify(response));
      return (
        response.data || {
          ocr_fullName: '',
          ocr_gender: '',
          ocr_birthDate: '',
          ocr_issueDate: '',
          ocr_expireDate: '',
        }
      );
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    apiPostAuthPassport,
  };
}

interface Params {
  formData: FormData;
}
