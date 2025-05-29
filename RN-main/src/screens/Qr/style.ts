import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  refreshButton: {},
  refreshButtonImage: {
    width: 32,
    height: 32,
  },
  body: {
    flexGrow: 1,
    backgroundColor: COLOR.WHITE,
  },
  bodyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrap: {
    borderRadius: 20,
    width: 277,
    height: 277,
    backgroundColor: COLOR.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  secondsTextWrap: {
    marginTop: 30,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 17,
    backgroundColor: '#F3F4F8',
  },
  secondsText: {
    color: COLOR.BLACK,
  },
  secondsTextHighlight: {
    color: COLOR.PRI_1_500,
  },
});
