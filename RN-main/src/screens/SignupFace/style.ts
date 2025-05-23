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
    marginTop: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceSymbolImage: {
    width: 80,
    height: 80,
  },
  faceSymbolText: {
    marginTop: 20,
    color: COLOR.BLACK,
  },
  faceImage: {
    width: 160,
    height: 200,
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
    paddingHorizontal: 7,
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
  nextButtonWrap: {
    marginBottom: 20,
    paddingHorizontal: 20,
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
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
