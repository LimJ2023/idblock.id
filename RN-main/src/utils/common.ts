import { Platform } from 'react-native';

import { getUniqueId } from 'react-native-device-info';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

import { ACTION_PUSH_DATA_TYPE } from '~/types/enum';
import { PushDataMessage } from '~/types/push.data';

class Util {
  public unsubscribeMessaging;
  public unsubscribeNotification;

  async pushListener({
    backgroundCallback,
    foregroundCallback,
    dataCallback,
  }: {
    backgroundCallback: (data: FirebaseMessagingTypes.RemoteMessage) => void;
    foregroundCallback: (data: FirebaseMessagingTypes.RemoteMessage) => void;
    dataCallback: (data: PushDataMessage) => void;
  }) {
    const goDetail = (message) => {
      if (message) {
        const strData = message.data?.data;

        if (strData) {
          const data = JSON.parse(strData);
          backgroundCallback(data);
        }
      }
    };

    if (Platform.OS === 'ios') {
      await messaging().getAPNSToken();
    }

    // 앱이 켜진 상태일 때
    this.unsubscribeMessaging = messaging().onMessage((message) => {
      if (!!message?.notification?.body) {
        foregroundCallback(message);

        PushNotification.localNotification({
          messageId: message.messageId,
          userInfo: message.data,
          /* Android Only Properties */
          channelId: 'idblock-push-notification',
          title: message.notification.title || '',
          message: message.notification.body,
          smallIcon: 'ic_notification',
          largeIcon: '',
        });
      } else if (message?.data) {
        const dataMessage = {
          type: message.data?.type as unknown as ACTION_PUSH_DATA_TYPE,
          data: message.data?.data || '',
        };

        dataCallback(dataMessage);
      }
    });

    // 백그라운드 상태에서 푸시를 눌렀을 때 (기존 실행)
    this.unsubscribeNotification = messaging().onNotificationOpenedApp(async (message) => {
      goDetail(message);
    });

    // 앱이 꺼진 상태에서 푸시를 눌렀을 때 (새로 실행)
    const message = await messaging().getInitialNotification();

    if (message) {
      goDetail(message);
    }
  }

  // async getGeolocationCurrentPosition(timeout = 8000): Promise<{
  //   status: WEB_GEOLOCATION_RESULT_STATUS_TYPE;
  //   longitude: number;
  //   latitude: number;
  // }> {
  //   const promise = new Promise<{
  //     status: WEB_GEOLOCATION_RESULT_STATUS_TYPE;
  //     longitude: number;
  //     latitude: number;
  //   }>(async (resolve) => {
  //     const defaultPosition = {
  //       status: WEB_GEOLOCATION_RESULT_STATUS_TYPE.OK,
  //       longitude: DEFAULT_POSITION.LAT,
  //       latitude: DEFAULT_POSITION.LONG,
  //     };

  //     if (Platform.OS === 'android') {
  //       const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

  //       if (permission === PermissionsAndroid.RESULTS.IS_NOT_GRANTED) {
  //         defaultPosition.status = WEB_GEOLOCATION_RESULT_STATUS_TYPE.NOT_PERMITTED;

  //         return resolve(defaultPosition);
  //       }
  //     } else if (Platform.OS === 'ios') {
  //       const permission = await Geolocation.requestAuthorization('whenInUse');

  //       if (permission === 'denied' || permission === 'disabled') {
  //         defaultPosition.status = WEB_GEOLOCATION_RESULT_STATUS_TYPE.NOT_PERMITTED;

  //         return resolve(defaultPosition);
  //       }
  //     }

  //     Geolocation.getCurrentPosition(
  //       (position) => {
  //         position.coords.latitude = Math.floor(position.coords.latitude * 10000000000) / 10000000000;
  //         position.coords.longitude = Math.floor(position.coords.longitude * 10000000000) / 10000000000;

  //         resolve({
  //           status: WEB_GEOLOCATION_RESULT_STATUS_TYPE.OK,
  //           ...position.coords,
  //         });
  //       },
  //       (error) => {
  //         /*
  //          * PERMISSION_DENIED = 1
  //          * POSITION_UNAVAILABLE = 2
  //          * TIMEOUT = 3
  //          * PLAY_SERVICE_NOT_AVAILABLE = 4
  //          * SETTINGS_NOT_SATISFIED = 5
  //          * INTERNAL_ERROR = -1
  //          */
  //         if (error.code === 3) {
  //           defaultPosition.status = WEB_GEOLOCATION_RESULT_STATUS_TYPE.TIMEOUT;
  //         } else {
  //           defaultPosition.status = WEB_GEOLOCATION_RESULT_STATUS_TYPE.NOT_AVAILABLE;
  //         }

  //         resolve(defaultPosition);
  //       },
  //       Platform.OS === 'android' && Number(DeviceInfo.getSystemVersion()) < 13
  //         ? {
  //             enableHighAccuracy: false,
  //             timeout: timeout,
  //             forceLocationManager: true,
  //           }
  //         : {
  //             enableHighAccuracy: true,
  //             timeout,
  //             forceLocationManager: true,
  //             accuracy: {
  //               android: 'low',
  //               ios: 'hundredMeters',
  //             },
  //           },
  //     );
  //   });

  //   return promise;
  // }

  numberWithCommas(x: number) {
    if (!x) {
      return '0';
    }

    return x
      .toString()
      .replace(/,/g, '')
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async set(key: string, value: any = null) {
    if (!value) {
      await AsyncStorage.removeItem(key);
    } else {
      const type = typeof value;

      if (type === 'string' || type === 'number') {
        await AsyncStorage.setItem(key, value);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }
  }

  async get(key: string) {
    if (!key) {
      return null;
    }

    const rawData = await AsyncStorage.getItem(key);

    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData);
    } catch (error) {
      return rawData;
    }
  }

  GUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}${s4()}`;
  }

  async getDeviceId() {
    return await getUniqueId();
  }

  getObjectFromUrl(url: string) {
    let params: any = {};

    const paramIndex = url.indexOf('?');

    if (paramIndex > -1) {
      const paramString = url.substring(paramIndex + 1);

      if (paramString) {
        const paramList = paramString.split('&');

        for (const paramObjString of paramList) {
          const paramObjList = paramObjString.split('=');

          if (paramObjList.length === 2) {
            params[paramObjList[0]] = paramObjList[1];
          }
        }
      }
    }

    return params;
  }

  sleep(ms: number): Promise<void> {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

    return promise;
  }

  degreeToRadian(value: number) {
    return (value * Math.PI) / 180;
  }

  calcDistanceTwoCoord(lat1, lng1, lat2, lng2) {
    const R = 6371; // km
    const dLat = this.degreeToRadian(lat2 - lat1);
    const dLng = this.degreeToRadian(lng2 - lng1);
    lat1 = this.degreeToRadian(lat1);
    lat2 = this.degreeToRadian(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return Math.floor(d * 10) / 10;
  }

  objectToQueryString(params: Object) {
    let queryString = '';

    for (const key of Object.keys(params)) {
      if (!queryString) {
        queryString += '?1=1';
      }

      if (Array.isArray(params[key])) {
        for (const data of params[key]) {
          queryString += `&${key}=${encodeURIComponent(data)}`;
        }
      } else {
        queryString += `&${key}=${encodeURIComponent(params[key])}`;
      }
    }

    return queryString;
  }

  getPathFromURL(originalURL: string) {
    const url = originalURL.replace(/https:\/\//g, '');
    const pathStartIndex = url.indexOf('/');
    const pathEndIndex = url.indexOf('?');
    const path = url.substring(pathStartIndex, pathEndIndex === -1 ? 9999 : pathEndIndex);

    return path;
  }

  getDomainFromURL(url: string) {
    const matched1 = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im);

    if (matched1?.length) {
      return matched1[0].replace('https://', '');
    }

    return '';
  }

  getMatchedURL(url: string) {
    if (!url) {
      return '';
    }

    const regExp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    const match = encodeURI(url.trim()).match(regExp);

    if (match && match[0]) {
      return match[0];
    }

    return '';
  }

  getTimeTextFromDate(d: Date) {
    const now = new Date().getTime();
    const diff = (now - d.getTime()) / 1000; // sec

    if (diff < 60) {
      return `${Math.round(diff)}초`;
    } else if (diff < 60 * 60) {
      return `${Math.round(diff / 60)}분`;
    } else if (diff < 60 * 60 * 24) {
      return `${Math.round(diff / (60 * 60))}시간`;
    } else if (diff < 60 * 60 * 24 * 7) {
      return `${Math.round(diff / (60 * 60 * 24))}일`;
    }

    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
  }

  regexPassword(text: string) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,15}$/i;

    return regex.test(text);
  }

  regexEmail(text: string) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

    return regex.test(text);
  }

  getFileAppendedFormData(path: string, form?: FormData) {
    const formData = form || new FormData();
    const name = path.substring(path.lastIndexOf('/') + 1);
    let type = '';

    if (path.endsWith('.png')) {
      type = 'image/png';
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      type = 'image/jpeg';
    } else if (path.endsWith('.webp')) {
      type = 'image/webp';
    }

    if (type && name) {
      const fileData = {
        uri: Platform.OS === 'android' ? path : (path || '').replace('file://', ''),
        type,
        name,
      };
      
      console.log('File upload data:', {
        uri: fileData.uri,
        type: fileData.type,
        name: fileData.name,
        platform: Platform.OS
      });
      
      formData.append('file', fileData);
    } else {
      console.log('Invalid file format or name:', { path, type, name });
      return undefined;
    }

    return formData;
  }
}

export default new Util();
