import { useCallback } from 'react';

import { useHttp } from '~/zustands/http';

import { HttpResponseList } from '~/types/http.response';
import { Notification } from '~/types/notification';

export function useApiGetNotificationList() {
  const { get } = useHttp();

  const apiGetNotificationList = useCallback(async () => {
    const response: HttpResponseList<Notification> = await get('/v1/notification');

    return response?.data || [];
  }, []);

  return {
    apiGetNotificationList,
  };
}
