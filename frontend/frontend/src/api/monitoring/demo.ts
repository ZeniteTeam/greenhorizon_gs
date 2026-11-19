const DEMO_LATENCY_MS = 450;

/**
 * When true (VITE_USE_DEMO=true in .env), the monitoring screens use the scripted demo scenario
 * from src/mocks instead of the backend. Useful for presentations without internet or satellite data.
 */
export const USE_DEMO = import.meta.env.VITE_USE_DEMO === 'true';

/** Resolves mock data with a network-like delay. */
export function fromDemo<T>(produce: () => T, latencyMs = DEMO_LATENCY_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(structuredClone(produce()));
      } catch (error) {
        reject(error);
      }
    }, latencyMs);
  });
}
