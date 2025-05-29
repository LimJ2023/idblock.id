import { StyleSheet } from 'react-native';

import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-screen-helper';

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
  header: {
    position: 'absolute',
    zIndex: 2,
    width: '100%',
    top: getStatusBarHeight() + 5,
    alignItems: 'flex-end',
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
  empty: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
  cameraWrap: {
    flex: 1,
  },
  noPermissionWrap: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  faceBorder: {
    position: 'absolute',
    backgroundColor: 'rgba(254, 79, 24, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(254, 79, 24, 0.7)',
  },
  captureButtonWrap: {
    position: 'absolute',
    zIndex: 2,
    bottom: getBottomSpace() + 20,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  captureButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});
