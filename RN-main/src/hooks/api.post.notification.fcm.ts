import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

export function useApiPostNotificationFcm() {
  const { post } = useHttp();

  const apiPostNotificationFcm = useCallback(async (params: Params) => {
    await post('/v1/notification/fcm', params);
  }, []);

  return {
    apiPostNotificationFcm,
  };
}

interface Params {
  fcmToken: string;
}
