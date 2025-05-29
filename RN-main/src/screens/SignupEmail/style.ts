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
  titleWrap: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#26282C',
  },
  formWrap: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  labelText: {
    color: COLOR.PRI_2_700,
  },
  inputWrapper: {
    marginTop: 10,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  nextButtonWrap: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
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
