import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    width: '100%',
    backgroundColor: COLOR.WHITE,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  messageText: {
    textAlign: 'center',
    color: COLOR.BLACK,
  },
  buttonWrap: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '48%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLOR.PRI_3_500,
  },
  cancelButtonText: {
    color: COLOR.UI_COLOR_500,
  },
  okButton: {
    width: '48%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLOR.PRI_1_500,
  },
  okButtonText: {
    color: COLOR.WHITE,
  },
});
