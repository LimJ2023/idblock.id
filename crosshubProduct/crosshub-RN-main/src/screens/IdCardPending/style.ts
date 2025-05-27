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
    paddingBottom: 70,
  },
  body: {
    flexGrow: 1,
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
  },
  idcardPendingCard: {
    marginTop: 20,
  },
  idcardPendingImage: {
    width: 280,
    height: 337,
  },
  profileWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  honoraryWrap: {
    borderWidth: 1,
    borderColor: COLOR.PRI_1_500,
    borderRadius: 8,
    alignItems: 'center',
  },
  honoraryText: {
    color: COLOR.PRI_1_500,
  },
  nameText: {
    marginTop: 13,
    marginBottom: 7,
    textAlign: 'center',
    color: COLOR.UI_COLOR_800,
  },
  pendingGuideText: {
    marginTop: 50,
    width: 280,
    textAlign: 'center',
    color: COLOR.UI_COLOR_600,
  },
});
