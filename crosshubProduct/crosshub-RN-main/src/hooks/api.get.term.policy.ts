import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { TERM_TYPE } from '~/types/enum';

export function useApiGetTermPolicy() {
  const { get } = useHttp();

  const apiGetTermPolicy = useCallback(async ({ termType }: Params) => {
    const htmlSource: string = await get(`/v1/common/html/${termType}`);

    return htmlSource || '';
  }, []);

  return {
    apiGetTermPolicy,
  };
}

interface Params {
  termType: TERM_TYPE;
}
