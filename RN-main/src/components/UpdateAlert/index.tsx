import { useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { getVersion } from 'react-native-device-info';
import { compare } from 'compare-versions';
import { useHttp } from '~/zustands/http';
import { Alert } from '~/components/Alert';

// Store URLs for app stores
const STORE_URLS = {
  ANDROID: 'https://play.google.com/store/apps/details?id=com.crosshub.idblock&hl=ko',
  IOS: 'https://apps.apple.com/kr/app/id6738164649',
};

export const UpdateAlert = () => {
  const { get } = useHttp();
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const currentVersion = getVersion();

  const deviceType = Platform.OS === 'android' ? 'ANDROID' : 'IOS';

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await get(`/v1/common/versions?deviceType=${deviceType}`);
        if (response?.data?.minVersion) {
          const minVersion = response.data.minVersion;
          const needsUpdate = compare(currentVersion, minVersion, '<');

          if (needsUpdate) {
            setShowUpdateAlert(true);
          }
        }
      } catch (error) {
        console.log('Failed to check app version:', error);
      }
    };

    checkVersion();
  }, [get, deviceType]);

  const handleUpdate = () => {
    const storeUrl = Platform.OS === 'android' ? STORE_URLS.ANDROID : STORE_URLS.IOS;
    Linking.openURL(storeUrl);
  };

  return (
    <Alert
      title="A New Version Is Available"
      isVisible={showUpdateAlert}
      message="For security and performance improvements, you must update to the latest version to continue using the app."
      okText="Let's Update!"
      onOk={handleUpdate}
    />
  );
};
