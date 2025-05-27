import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

export function useApiDeleteAuthSignout() {
  const { del } = useHttp();

  const apiDeleteAuthSignout = useCallback(async () => {
    await del('/v1/auth/logout');
  }, []);

  return {
    apiDeleteAuthSignout,
  };
}
