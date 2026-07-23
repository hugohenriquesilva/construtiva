import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E2E5',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    width: 260,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  city: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#8A8A8E',
    marginRight: 4,
  },
  cnpjBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },
  cnpjText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    color: '#4A4A4A',
    marginLeft: 4,
    fontWeight: '600',
  },
  ctaButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  ctaText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
  },
});