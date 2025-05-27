import { useCallback } from 'react';

import { Platform } from 'react-native';

import { PERMISSIONS, PermissionStatus, request, check, Permission } from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';

export function usePermissionCheck() {
  const notificationHasPermission = useCallback(async () => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return 'error';
    } else {
      try {
        if (Platform.OS === 'ios') {
          const result = await messaging().hasPermission();

          if (result === messaging.AuthorizationStatus.AUTHORIZED || result === messaging.AuthorizationStatus.PROVISIONAL) {
            return 'granted';
          } else {
            return 'denied';
          }
        } else {
          const osVersion = Number(Platform.constants['Release']);

          if (osVersion >= 13) {
            const result = await check('android.permission.POST_NOTIFICATIONS' as Permission);

            return result;
          }

          return 'granted';
        }
      } catch (error) {
        return 'error';
      }
    }
  }, []);

  const notificationPermissionCheck = useCallback(async (): Promise<PermissionStatus | 'error'> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return 'error';
    } else {
      try {
        if (Platform.OS === 'ios') {
          const result = await messaging().requestPermission();

          if (result === messaging.AuthorizationStatus.AUTHORIZED || result === messaging.AuthorizationStatus.PROVISIONAL) {
            return 'granted';
          } else {
            return 'denied';
          }
        } else {
          const osVersion = Number(Platform.constants['Release']);

          if (osVersion >= 13) {
            const result = await request('android.permission.POST_NOTIFICATIONS' as Permission);

            return result;
          }

          return 'granted';
        }
      } catch (error) {
        return 'error';
      }
    }
  }, []);

  const cameraPermissionCheck = useCallback(async (): Promise<PermissionStatus | 'error'> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return 'error';
    } else {
      try {
        if (Platform.OS === 'ios') {
          return await request(PERMISSIONS.IOS.CAMERA);
        } else {
          const result1 = await request(PERMISSIONS.ANDROID.CAMERA);

          // const osVersion = Number(Platform.constants['Release']);

          // if (osVersion >= 13) {
          //   const result2 = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);

          //   if (result1 === 'granted' && result2 === 'granted') {
          //     return 'granted';
          //   } else {
          //     return 'error';
          //   }
          // } else {
          //   const result2 = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          //   const result3 = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

          //   if (result1 === 'granted' && result2 === 'granted' && result3 === 'granted') {
          //     return 'granted';
          //   } else {
          //     return 'error';
          //   }
          // }

          return result1;
        }
      } catch (error) {
        return 'error';
      }
    }
  }, []);

  const galleryPermissionCheck = useCallback(async (): Promise<PermissionStatus | 'error'> => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return 'error';
    } else {
      try {
        if (Platform.OS === 'ios') {
          return await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        } else {
          const osVersion = Number(Platform.constants['Release']);

          if (osVersion >= 13) {
            const result1 = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
            const result2 = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

            if (result1 === 'granted' && result2 === 'granted') {
              return 'granted';
            } else {
              return 'error';
            }
          } else {
            const result1 = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
            const result2 = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);

            if (result1 === 'granted' && result2 === 'granted') {
              return 'granted';
            } else {
              return 'error';
            }
          }
        }
      } catch (error) {
        return 'error';
      }
    }
  }, []);

  return {
    notificationHasPermission,
    notificationPermissionCheck,
    galleryPermissionCheck,
    cameraPermissionCheck,
  };
}
