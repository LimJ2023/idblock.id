import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseList } from '~/types/http.response';
import { Country } from '~/types/country';

export function useApiGetCountryList() {
  const { get } = useHttp();

  const apiGetCountryList = useCallback(async () => {
    const response: HttpResponseList<Country> = await get('/v1/common/country');

    return response?.data || [];
  }, []);

  return {
    apiGetCountryList,
  };
}
