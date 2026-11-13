/**
 * Utilidad de Monitoreo de Rendimiento de Usuario Real (Real User Monitoring - RUM)
 * Mide Core Web Vitals (LCP, INP, CLS, TTFB) utilizando la API nativa PerformanceObserver.
 */

export interface MetricReport {
  name: 'LCP' | 'INP' | 'CLS' | 'TTFB';
  value: number;
  rating: 'bueno' | 'necesita-mejora' | 'pobre';
}

function getRating(name: string, value: number): 'bueno' | 'necesita-mejora' | 'pobre' {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'bueno' : value <= 4000 ? 'necesita-mejora' : 'pobre';
    case 'INP':
      return value <= 200 ? 'bueno' : value <= 500 ? 'necesita-mejora' : 'pobre';
    case 'CLS':
      return value <= 0.1 ? 'bueno' : value <= 0.25 ? 'necesita-mejora' : 'pobre';
    case 'TTFB':
      return value <= 800 ? 'bueno' : value <= 1800 ? 'necesita-mejora' : 'pobre';
    default:
      return 'bueno';
  }
}

export function initWebVitalsRUM(onReport?: (metric: MetricReport) => void): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const report = (name: MetricReport['name'], value: number) => {
    const formattedVal = Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1);
    const metric: MetricReport = {
      name,
      value: formattedVal,
      rating: getRating(name, formattedVal),
    };

    if (onReport) {
      onReport(metric);
    } else if (process.env.NODE_ENV !== 'production') {
      console.debug(`[Core Web Vitals RUM] ${metric.name}: ${metric.value} (${metric.rating})`);
    }
  };

  try {
    // 1. TTFB (Time to First Byte)
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      report('TTFB', navEntries[0].responseStart);
    }

    // 2. LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        report('LCP', lastEntry.startTime);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 3. CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      report('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // 4. INP (Interaction to Next Paint)
    const inpObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries() as any[]) {
        if (entry.duration) {
          report('INP', entry.duration);
        }
      }
    });
    inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
  } catch (e) {
    // Graceful fallback if observer types are unsupported
  }
}
