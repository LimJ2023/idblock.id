import { StyleSheet, Platform } from 'react-native';

import { isIphoneX } from 'react-native-iphone-screen-helper';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  wrapper: {
    paddingBottom: 10,
  },
  container: {
    height: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 16,
    borderColor: COLOR.GRAY_600,
    paddingHorizontal: Platform.select({
      android: 12,
      ios: 15,
    }),
  },
  input: {
    paddingVertical: 0,
    color: COLOR.PRI_2_400,
  },
  messageText: {
    marginLeft: 6,
    marginTop: 5,
  },
  countText: {
    position: 'absolute',
    right: 4,
    bottom: -10,
    color: COLOR.GRAY_200,
  },
  buttonEye: {
    position: 'absolute',
    right: 31,
    top: Platform.select({
      android: '17%',
      ios: isIphoneX() ? '18%' : '15%',
    }),
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  buttonClose: {
    position: 'absolute',
    right: 0,
    top: Platform.select({
      android: '17%',
      ios: isIphoneX() ? '18%' : '15%',
    }),
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  imageButtonEye: {
    width: 25,
    height: 25,
  },
  imageButtonClose: {
    width: 25,
    height: 25,
  },
});
