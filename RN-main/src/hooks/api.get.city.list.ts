import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseList } from '~/types/http.response';
import { City } from '~/types/city';

export function useApiGetCityList() {
  const { get } = useHttp();

  const apiGetCityList = useCallback(async ({ code }: Params) => {
    const response: HttpResponseList<City> = await get('/v1/common/city', {
      countryCode: code,
    });

    return response?.data || [];
  }, []);

  return {
    apiGetCityList,
  };
}

interface Params {
  code: string;
}
