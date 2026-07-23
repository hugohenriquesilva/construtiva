import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E5',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 12,
    width: 260,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
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
    fontSize: 12,
    color: '#8A8A8E',
    marginRight: 4,
  },
  cnpjBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF6E5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  cnpjText: {
    fontSize: 11,
    color: '#B87700',
    marginLeft: 4,
    fontWeight: '600',
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    textDecorationLine: 'underline',
    marginTop: 6,
  },
});
