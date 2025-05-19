import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  body: {
    flexGrow: 1,
    backgroundColor: COLOR.WHITE,
  },
  bodyContent: {
    flex: 1,
  },
  contentWrap: {
    marginTop: 120,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishImage: {
    marginTop: 50,
    width: 60,
    height: 60,
  },
  finishTitleText: {
    marginTop: 50,
    color: COLOR.BLACK,
  },
  finishContentText: {
    marginTop: 15,
    textAlign: 'center',
    color: COLOR.GRAY_900,
  },
  nextButtonWrap: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.PRI_1_500,
  },
  nextButtonText: {
    color: COLOR.WHITE,
  },
});
