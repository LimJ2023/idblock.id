import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponse } from '~/types/http.response';
import { Profile } from '~/types/profile';

export function useApiGetAuthProfile() {
  const { get } = useHttp();

  const apiGetAuthProfile = useCallback(async () => {
    const response: HttpResponse<Profile> = await get('/v1/auth/profile');

    if (response.data?.id) {
      return response.data;
    }

    return {};
  }, []);

  return {
    apiGetAuthProfile,
  };
}
