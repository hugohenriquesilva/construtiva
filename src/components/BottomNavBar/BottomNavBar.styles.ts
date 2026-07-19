import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#DCE2F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabButton: {
    paddingHorizontal: 8,
  },
});
