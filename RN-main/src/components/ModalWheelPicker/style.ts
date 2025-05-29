import { StyleSheet } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-screen-helper';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
    justifyContent: 'flex-end',
  },
  pickerWrap: {
    backgroundColor: COLOR.WHITE,
    justifyContent: 'space-between',
  },
  pickerTitleWrap: {
    paddingHorizontal: 20,
  },
  pickerTitleText: {
    color: COLOR.GRAY_900,
  },
  selectedIndicatorStyle: {
    backgroundColor: COLOR.PRI_1_100,
  },
  pickerItemText: {
    color: COLOR.GRAY_900,
  },
  buttonWrap: {
    width: '100%',
    paddingBottom: getBottomSpace() + 25,
    alignItems: 'center',
  },
  button: {
    width: '90%',
    height: 56,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: COLOR.WHITE,
  },
});
