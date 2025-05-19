import { StyleSheet } from 'react-native';

import { getStatusBarHeight } from 'react-native-iphone-screen-helper';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    zIndex: 1,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    top: 12,
    right: 0,
    paddingHorizontal: 20,
  },
  headerButton: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    marginLeft: 4,
  },
  headerButtonImage: {
    width: 32,
    height: 32,
  },
  body: {
    backgroundColor: COLOR.WHITE,
  },
  buttonWrap: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  mainButton: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '10%',
    backgroundColor: '#F5F5F6',
    marginBottom: 8,
  },
  mainButtonImage: {
    width: 40,
    height: 40,
  },
  mainButtonText: {
    color: COLOR.UI_COLOR_500,
  },
  footer: {
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
  },
  logoImage: {
    marginTop: 20,
    width: 76,
    height: 22,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: COLOR.PRI_1_400,
  },
  menuHeader: {
    paddingTop: getStatusBarHeight() + 5,
    alignItems: 'flex-end',
  },
  menuCloseButton: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  menuCloseButtonImage: {
    width: 32,
    height: 32,
  },
  menuBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonWrap: {
    paddingBottom: '35%',
  },
  menuButton: {
    paddingHorizontal: 40,
    paddingVertical: 10,
  },
  menuButtonText: {
    color: COLOR.GRAY_100,
  },
  versionText: {
    position: 'absolute',
    bottom: '15%',
    color: COLOR.PRI_1_100,
  },
});
