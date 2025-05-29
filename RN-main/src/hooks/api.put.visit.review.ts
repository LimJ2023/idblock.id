import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

export function useApiPutVisitReview() {
  const { put } = useHttp();

  const apiPutVisitReview = useCallback(async (params: Params) => {
    await put(`/v1/site/review/${params.visitId}`, {
      content: params.content,
    });
  }, []);

  return {
    apiPutVisitReview,
  };
}

interface Params {
  visitId: string;
  content: string;
}
