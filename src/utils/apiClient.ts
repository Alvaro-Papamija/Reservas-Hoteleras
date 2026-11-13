/**
 * Cliente HTTP optimizado para alto rendimiento:
 * - Deduplicación de peticiones en vuelo (evita requests duplicadas concurrentes)
 * - Caché en cliente con TTL configurable
 * - Timeouts automáticos con AbortController
 * - Ejecución de peticiones paralelas independientes
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class PerformanceApiClient {
  private inFlightRequests: Map<string, Promise<any>> = new Map();
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTimeoutMs: number = 8000;

  /**
   * Realiza una petición GET con deduplicación en vuelo y caché en memoria
   */
  async get<T>(url: string, options: { ttlMs?: number; timeoutMs?: number; skipCache?: boolean } = {}): Promise<T> {
    const { ttlMs = 30000, timeoutMs = this.defaultTimeoutMs, skipCache = false } = options;

    // 1. Revisar caché en memoria si no está vencido
    if (!skipCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() < cached.expiry) {
        return cached.data as T;
      }
    }

    // 2. Deduplicación de peticiones idénticas en vuelo (in-flight deduplication)
    if (this.inFlightRequests.has(url)) {
      return this.inFlightRequests.get(url) as Promise<T>;
    }

    // 3. Crear nueva petición con timeout de red
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const data: T = await response.json();

        // Guardar en caché si se definió TTL
        if (ttlMs > 0) {
          this.cache.set(url, {
            data,
            expiry: Date.now() + ttlMs,
          });
        }

        return data;
      } finally {
        clearTimeout(timer);
        this.inFlightRequests.delete(url);
      }
    })();

    this.inFlightRequests.set(url, requestPromise);
    return requestPromise;
  }

  /**
   * Lanza peticiones independientes en paralelo en lugar de encadenarlas
   */
  async fetchInParallel<T>(urls: string[]): Promise<PromiseSettledResult<T>[]> {
    return Promise.allSettled(urls.map((url) => this.get<T>(url)));
  }

  /**
   * Invalida la caché de una URL específica o de todo el almacén
   */
  invalidateCache(urlPattern?: string): void {
    if (!urlPattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiClient = new PerformanceApiClient();
