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
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLOR.UI_COLOR_800,
  },
  methodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    minWidth: '45%',
    flexGrow: 1,
    // paddingVertical: 5,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodButtonSelected: {
    borderColor: COLOR.GRAY_900,
    borderWidth: 2,
    backgroundColor: '#F5F5F6',
  },
  methodLabel: {
    fontSize: 17,
    color: COLOR.UI_COLOR_800,
    fontWeight: '500',
  },
  methodLabelSelected: {
    color: COLOR.PRI_1_500,
    fontWeight: 'bold',
  },
  installmentDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  installmentLabel: {
    fontSize: 16,
    color: COLOR.GRAY_600,
  },
  installmentValue: {
    fontSize: 16,
    color: COLOR.GRAY_800,
    fontWeight: 'bold',
  },
  installmentListWrap: {
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
  },
  installmentItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  installmentItemText: {
    fontSize: 16,
    color: COLOR.GRAY_800,
  },
  creditCardButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5', // GRAY_200 대신 실제 회색 사용
    color: COLOR.BLACK,
  },
  creditCardButtonText: {
    fontSize: 18,
    color: COLOR.BLACK,
    fontWeight: 'bold',
  },
  methodImage: {
    width: '100%',
    height: 60,
    resizeMode: 'center',
    marginBottom: 8,
    marginTop: 8,
  }
}); 