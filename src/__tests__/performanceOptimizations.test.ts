import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../utils/apiClient';

describe('Optimizaciones de Red - API Client con Deduplicación y Caché', () => {
  beforeEach(() => {
    apiClient.invalidateCache();
    vi.restoreAllMocks();
  });

  it('Deduplica peticiones idénticas concurrentes en vuelo (In-Flight Deduplication)', async () => {
    let callCount = 0;
    const fakeData = { status: 'OK', count: 42 };

    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      callCount++;
      // Simular latencia de red de 20ms
      await new Promise((r) => setTimeout(r, 20));
      return {
        ok: true,
        status: 200,
        json: async () => fakeData,
      };
    }));

    // Lanzar dos peticiones simultáneas a la misma URL
    const promise1 = apiClient.get('/api/habitaciones');
    const promise2 = apiClient.get('/api/habitaciones');

    const [res1, res2] = await Promise.all([promise1, promise2]);

    expect(res1).toEqual(fakeData);
    expect(res2).toEqual(fakeData);
    // Debe haber llamado a fetch solo 1 vez gracias a la deduplicación
    expect(callCount).toBe(1);
  });

  it('Retorna datos desde la caché en memoria si no ha expirado el TTL', async () => {
    let callCount = 0;
    const sample = [{ id: 101, numero: '101' }];

    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        status: 200,
        json: async () => sample,
      };
    }));

    // Primera llamada (guarda en caché por 30s)
    const first = await apiClient.get('/api/habitaciones/resumen', { ttlMs: 30000 });
    expect(first).toEqual(sample);
    expect(callCount).toBe(1);

    // Segunda llamada inmediata (debe venir de caché)
    const second = await apiClient.get('/api/habitaciones/resumen', { ttlMs: 30000 });
    expect(second).toEqual(sample);
    expect(callCount).toBe(1); // fetch NO se llamó de nuevo
  });

  it('Ejecuta peticiones independientes en paralelo con fetchInParallel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      return {
        ok: true,
        status: 200,
        json: async () => ({ endpoint: url }),
      };
    }));

    const results = await apiClient.fetchInParallel([
      '/api/habitaciones',
      '/api/habitaciones/resumen',
      '/api/habitaciones/salud',
    ]);

    expect(results.length).toBe(3);
    results.forEach((r) => {
      expect(r.status).toBe('fulfilled');
    });
  });
});
