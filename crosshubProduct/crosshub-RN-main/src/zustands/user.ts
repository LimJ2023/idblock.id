import { StateCreator, create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';

import { Profile } from '~/types/profile';

interface Action {
  setProfile: (profile: Profile) => void;
}

interface Store {
  profile: Profile;
  action: Action;
}

const initialValue: Omit<Store, 'action'> = {
  profile: {},
};

const useStore: StateCreator<Store, [], []> = (set) => ({
  ...initialValue,
  action: {
    setProfile: (profile: Profile) => {
      set({
        profile,
      });
    },
  },
});

export const useUser = __DEV__
  ? create<Store>()(
      devtools(useStore, {
        anonymousActionType: 'profile',
        name: 'profile',
      }),
    )
  : create<Store>()(useStore);

export const useProfile = () =>
  useUser(
    useShallow((state) => ({
      profile: state.profile,
    })),
  );

export const useUserAction = () => useUser(useShallow((state) => state.action));
