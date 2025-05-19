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
    paddingBottom: 20,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
  },
  logoImage: {
    marginTop: 40,
    width: 144,
    height: 141,
  },
  formWrap: {
    width: '100%',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  titleText: {
    textAlign: 'center',
    color: COLOR.BLACK,
  },
  formInputWrapper: {
    marginTop: 60,
    width: '100%',
  },
  formInputContainer: {
    backgroundColor: '#F5F5F6',
  },
  nextButtonWrap: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  nextButton: {
    marginTop: 10,
    marginBottom: 30,
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    marginVertical: 5,
    fontWeight: 600,
    textAlign: 'center',
    textAlignVertical: 'bottom',
    color: COLOR.GRAY_800,
  },
  guideResendText: {
    color: COLOR.PRI_1_500,
    fontWeight: 700,
  },
});
