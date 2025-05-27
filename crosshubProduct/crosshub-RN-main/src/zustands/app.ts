import { ColorValue, Platform, StatusBar } from 'react-native';
import { StateCreator, create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { COLOR } from '~/utils/guide';

interface Action {
  setDimension: (dimension: Dimension) => void;
  setAccessToken: (accessToken: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setIsVisibleLoading: (isVisibleLoading: boolean) => void;
  setIsBiometricsSigned: (isBiometricsSigned: boolean) => void;
  setSafeAreaColor: (safeAreaColor: ColorValue) => void;
}

interface Store {
  dimension: Dimension;
  accessToken: string;
  refreshToken: string;
  isVisibleLoading: boolean;
  isBiometricsSigned: boolean;
  safeAreaColor: ColorValue;
  action: Action;
}

const initialValue: Omit<Store, 'action'> = {
  dimension: undefined,
  accessToken: '',
  refreshToken: '',
  isVisibleLoading: false,
  isBiometricsSigned: false,
  safeAreaColor: COLOR.WHITE,
};

const useStore: StateCreator<Store, [], []> = (set) => ({
  ...initialValue,
  action: {
    setDimension: (dimension: Dimension) => {
      set({
        dimension,
      });
    },
    setAccessToken: (accessToken: string) => {
      set({
        accessToken,
      });
    },
    setRefreshToken: (refreshToken: string) => {
      set({
        refreshToken,
      });
    },
    setIsVisibleLoading: (isVisibleLoading: boolean) => {
      set({
        isVisibleLoading,
      });
    },
    setIsBiometricsSigned: (isBiometricsSigned: boolean) => {
      set({
        isBiometricsSigned,
      });
    },
    setSafeAreaColor: (safeAreaColor: ColorValue) => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(safeAreaColor);
      }

      set({
        safeAreaColor,
      });
    },
  },
});

export const useAppRoot = __DEV__
  ? create<Store>()(
      devtools(useStore, {
        anonymousActionType: 'app',
        name: 'app',
      }),
    )
  : create<Store>()(useStore);

export const useDimension = () =>
  useAppRoot(
    useShallow((state) => ({
      dimension: state.dimension,
    })),
  );

export const useAccessToken = () =>
  useAppRoot(
    useShallow((state) => ({
      accessToken: state.accessToken,
    })),
  );

export const useRefreshToken = () =>
  useAppRoot(
    useShallow((state) => ({
      refreshToken: state.refreshToken,
    })),
  );

export const useIsVisibleLoading = () =>
  useAppRoot(
    useShallow((state) => ({
      isVisibleLoading: state.isVisibleLoading,
    })),
  );

export const useIsBiometricsSigned = () =>
  useAppRoot(
    useShallow((state) => ({
      isBiometricsSigned: state.isBiometricsSigned,
    })),
  );

export const useSafeAreaColor = () =>
  useAppRoot(
    useShallow((state) => ({
      safeAreaColor: state.safeAreaColor,
    })),
  );

export const useAppRootAction = () => useAppRoot(useShallow((state) => state.action));

export interface Dimension {
  width: number;
  height: number;
}
