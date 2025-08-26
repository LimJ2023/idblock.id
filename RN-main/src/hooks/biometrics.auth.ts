import { useCallback, useEffect } from 'react';

import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics';

const biometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

export function useBiometricsAuth() {
  const isAbleBiometrics = useCallback(async (): Promise<BiometicsResultType> => {


    try {
      const { available, biometryType, error } = await biometrics.isSensorAvailable();

      if (error === 'BIOMETRIC_ERROR_NONE_ENROLLED') {
        return 'NOT_AVAILABLE';
      }

      if (error) {
        return 'ERROR';
      } else if (!available) {
        return 'NOT_AVAILABLE';
      } else if (available) {
        return biometryType;
      }
    } catch (error) {
      console.log('useBiometricsAuth > isAbleBiometrics', error);
    }

    return 'ERROR';
  }, []);

  const reqBiometricsLogin = useCallback(async (message: string = 'Verification is required to proceed') => {


    try {
      const { success, error } = await biometrics.simplePrompt({
        promptMessage: message,
      });

      if (success) {
        return true;
      }

      console.log('useBiometricsAuth > reqBiometricsLogin > Code eror', error);
    } catch (error) {
      console.log('useBiometricsAuth > reqBiometricsLogin', error);
    }

    return false;
  }, []);

  useEffect(() => {
    biometrics.deleteKeys();
  }, []);

  return {
    isAbleBiometrics,
    reqBiometricsLogin,
  };
}

export type BiometicsResultType = BiometryType | ('ERROR' | 'NOT_AVAILABLE');
