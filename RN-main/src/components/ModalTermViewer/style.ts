import { StyleSheet } from 'react-native';

import { getStatusBarHeight } from 'react-native-iphone-screen-helper';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR.WHITE,
  },
  pdf: {
    flex: 1,
  },
  header: {
    width: '100%',
    paddingTop: getStatusBarHeight() + 5,
    alignItems: 'flex-end',
    backgroundColor: COLOR.WHITE,
  },
  headerCloseButton: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerCloseButtonImage: {
    width: 32,
    height: 32,
  },
});
