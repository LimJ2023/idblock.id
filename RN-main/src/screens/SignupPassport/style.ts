import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLOR.WHITE,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    backgroundColor: COLOR.WHITE,
  },
  bodyContent: {
    flex: 1,
  },
  guideWrap: {
    width: '100%',
    marginTop: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passportImage: {
    width: 256,
    height: 370,
  },
  passportSampleImage: {
    width: 256,
    height: 370,
  },
  registeredImage: {
    marginTop: 35,
    marginBottom: 35,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
  },
  registeredImageWrap: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  registeredImageText: {
    color: COLOR.PRI_2_500,
  },
  registeredImageIcon: {
    marginLeft: 5,
    marginBottom: 1,
    width: 13,
    height: 13,
  },
  guideContentWrap: {
    marginTop: 35,
    marginBottom: 35,
    width: '90%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  guideContentTitleText: {
    marginBottom: 10,
    color: COLOR.UI_COLOR_400,
  },
  guideContentTextWrap: {
    marginBottom: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guideContentHead: {
    marginTop: -4,
    marginRight: 5,
    color: COLOR.PRI_2_500,
  },
  guideContentText: {
    color: COLOR.PRI_2_500,
    lineHeight: 12 * 1.5,
  },
  cameraButton: {
    marginBottom: 10,
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.PRI_2_500,
  },
  cameraButtonImage: {
    marginRight: 4,
    width: 24,
    height: 24,
  },
  cameraButtonText: {
    color: COLOR.WHITE,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: COLOR.PRI_1_500,
    textAlign: 'center',
  },
  passportCameraButton: {
    marginBottom: 10,
    flexDirection: 'row',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.PRI_2_500,
  },
  passportCameraButtonWrap: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  passportDataText: {
    marginTop: 8,
    color: COLOR.PRI_2_500,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLOR.PRI_2_300,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    color: COLOR.PRI_2_500,
  },
});
