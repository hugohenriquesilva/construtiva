import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  box: {
    backgroundColor: '#D9D9D9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  boxError: {
    borderWidth: 2,
    borderColor: 'red',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5B69A3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  overlayBadgeTrash: {
    backgroundColor: 'red',
  },
});
