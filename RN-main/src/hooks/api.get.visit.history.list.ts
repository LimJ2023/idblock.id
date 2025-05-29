import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseList } from '~/types/http.response';
import { Visit } from '~/types/visit';

export function useApiGetVisitHistoryList() {
  const { get } = useHttp();

  const apiGetVisitHistoryList = useCallback(async () => {
    const response: HttpResponseList<Visit> = await get('/v1/site/visit-history');

    return response?.data || [];
  }, []);

  return {
    apiGetVisitHistoryList,
  };
}
