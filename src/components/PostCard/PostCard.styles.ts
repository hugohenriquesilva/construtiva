import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#E2E2E5',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  metaLine: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#8A8A8E',
    marginBottom: 8,
  },
  author: {
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#1A1A1A',
  },
  date: {
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8E',
  },
  excerpt: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#4A4A4A',
    lineHeight: 18,
  },
});