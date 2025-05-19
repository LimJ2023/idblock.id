import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  logoWrap: {
    paddingTop: 65,
    paddingHorizontal: 20,
  },
  logoTextWrap: {
    zIndex: 1,
    paddingLeft: 12,
  },
  logoTextImage: {
    width: 216,
    height: 116,
  },
  logoText1: {
    marginTop: 20,
    color: COLOR.UI_COLOR_300,
    letterSpacing: 0,
  },
  logoText2: {
    color: COLOR.UI_COLOR_300,
    letterSpacing: 0,
  },
  shieldImage: {
    position: 'absolute',
    top: 80,
    left: 155,
    width: 232,
    height: 267,
  },
});
