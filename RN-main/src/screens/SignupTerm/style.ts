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
  termWrap: {
    marginTop: 120,
    paddingHorizontal: 20,
  },
  termListWrap: {
    marginTop: 20,
  },
  checkAllLeftWrap: {
    width: '10%',
  },
  checkAllCenterWrap: {
    width: '90%',
  },
  checkedImage: {
    marginTop: 1,
    width: 24,
    height: 24,
  },
  allUnchecked: {
    width: 24,
    height: 24,
    backgroundColor: '#F7F7F7',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#D8D7DB',
  },
  termTitleText: {
    color: COLOR.UI_COLOR_800,
  },
  checkWrap: {
    marginBottom: 15,
  },
  checkLeftWrap: {
    width: '10%',
  },
  checkCenterWrap: {
    width: '80%',
  },
  checkRightWrap: {
    width: '10%',
    alignItems: 'flex-end',
  },
  checkRightButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  checkRightImage: {
    width: 16,
    height: 16,
  },
  nextButtonWrap: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
