import { useCallback } from 'react';

import { useAppRootAction } from '~/zustands/app';

import { KEY_STORAGE } from '~/utils/constant';
import Util from '~/utils/common';

export function useInitTokenFromStorage() {
  const { setAccessToken, setRefreshToken } = useAppRootAction();

  const initTokenFromStorage = useCallback(async () => {
    const accessToken = await Util.get(KEY_STORAGE.ACCESS_TOKEN);
    const refreshToken = await Util.get(KEY_STORAGE.REFRESH_TOKEN);

    setAccessToken(accessToken || '');
    setRefreshToken(refreshToken || '');
  }, []);

  return {
    initTokenFromStorage,
  };
}
