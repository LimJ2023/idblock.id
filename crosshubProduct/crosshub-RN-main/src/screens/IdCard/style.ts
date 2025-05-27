import { StyleSheet } from 'react-native';

import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAEFE7',
  },
  containerImageBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 329,
    height: 362,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
  },
  idcardPendingCard: {},
  profileWrap: {
    width: 280,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  profileTitleText: {
    textAlign: 'center',
    color: COLOR.UI_COLOR_900,
  },
  profileTitleCaptionText: {
    marginTop: 8,
    textAlign: 'center',
    color: COLOR.PRI_2_300,
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  nameText: {
    marginTop: 10,
    textAlign: 'left',
    color: COLOR.UI_COLOR_400,
  },
  honoraryWrap: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: COLOR.PRI_1_500,
    borderRadius: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  honoraryText: {
    color: COLOR.PRI_1_500,
  },
  pendingGuideText: {
    marginTop: 50,
    width: 280,
    textAlign: 'center',
    color: COLOR.UI_COLOR_600,
  },
  bottomButtonWrap: {
    width: '100%',
    backgroundColor: 'rgba(255, 221, 204, 0.5)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomButton: {
    width: '45%',
    height: 55,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonSeparator: {
    width: 1,
    height: 24,
    borderRightWidth: 1,
    borderRightColor: COLOR.PRI_1_100,
  },
  bottomButtonImage: {
    marginRight: 10,
    width: 24,
    height: 24,
  },
  bottomButtonText: {
    color: COLOR.PRI_2_500,
  },
});
