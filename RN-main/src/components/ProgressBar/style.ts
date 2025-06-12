import { StyleSheet } from 'react-native';
import { COLOR } from '~/utils/guide';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    backgroundColor: COLOR.WHITE,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 32,
    width: '80%',
    maxWidth: 320,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: COLOR.BLACK,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBackground: {
    height: 8,
    backgroundColor: COLOR.PRI_3_200,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLOR.PRI_1_500,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    color: COLOR.PRI_3_600,
  },
  stepsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLabel: {
    flex: 1,
  },
  currentStepText: {
    marginTop: 16,
    textAlign: 'center',
    color: COLOR.PRI_3_600,
    fontStyle: 'italic',
  },
}); 