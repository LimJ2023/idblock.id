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
    backgroundColor: COLOR.WHITE,
    paddingBottom: 20,
  },
  formWrap: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  formInputWrapper: {},
  formInputContainer: {
    borderColor: '#F5F5F6',
    backgroundColor: '#F5F5F6',
  },
  messageTextWrap: {
    marginBottom: 30,
  },
  messageText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: COLOR.ERROR,
  },
  button: {
    marginTop: 10,
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinButton: {
    backgroundColor: COLOR.PRI_1_500,
  },
  signupButton: {
    backgroundColor: COLOR.PRI_2_500,
  },
  buttonText: {
    color: COLOR.WHITE,
  },
  footer: {
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
  },
  resetButton: {
    marginTop: -5,
    paddingVertical: 7,
  },
  resetButtonText: {
    color: COLOR.GRAY_800,
  },
  logoImage: {
    marginTop: 24,
    width: 76,
    height: 22,
  },
});
