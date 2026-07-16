import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E2E2E5',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9B9B9B',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6E6E73',
  },
});
