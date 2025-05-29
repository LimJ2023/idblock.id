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
  contentText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666666',
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
  contactUsText: {
    marginBottom: 2,
    textAlign: 'center',
    color: COLOR.GRAY_800,
  },
  contactUsMailText: {
    color: COLOR.GRAY_800,
    fontWeight: 700,
    textDecorationLine: 'underline',
    textDecorationColor: COLOR.GRAY_800,
  },
});
