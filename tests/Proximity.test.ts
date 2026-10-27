import { describe, expect, it } from 'vitest';
import { compareByProximity, distanceKm, hasValidCoordinates } from '../src/utils/proximity';

describe('ordenação por proximidade', () => {
  it('calcula distância zero e cerca de 111 km por grau no equador', () => {
    expect(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBe(0);
    expect(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 })).toBeCloseTo(111.195, 2);
  });
  it('rejeita coordenadas ausentes ou inválidas e aceita zero', () => {
    expect(hasValidCoordinates(null)).toBe(false);
    expect(hasValidCoordinates({ latitude: NaN, longitude: 0 })).toBe(false);
    expect(hasValidCoordinates({ latitude: 0, longitude: 181 })).toBe(false);
    expect(hasValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true);
  });
  it('prioriza distância, desempata pelo nome e mantém os sem distância no fim', () => {
    const profiles = [
      { id: '1', name: 'Ana' },
      { id: '2', name: 'Zeca', distanceKm: 1 },
      { id: '3', name: 'Bruno', distanceKm: 2 },
      { id: '4', name: 'Ana', distanceKm: 2 },
      { id: '5', name: 'Bia' },
    ];
    expect(profiles.sort(compareByProximity).map((p) => p.id)).toEqual(['2', '4', '3', '1', '5']);
  });
});
