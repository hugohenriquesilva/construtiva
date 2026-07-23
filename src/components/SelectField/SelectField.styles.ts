import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  fieldText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#1A1A1A',
  },
  placeholderText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#9B9B9B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionSelected: {
    backgroundColor: '#EEF0F8',
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1A1A1A',
  },
});
