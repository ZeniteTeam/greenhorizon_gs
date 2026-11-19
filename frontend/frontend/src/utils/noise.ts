/** Deterministic pseudo-random value in [-1, 1] for a (seed, index) pair. */
export function noise(seed: number, i: number): number {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  return (x - Math.floor(x)) * 2 - 1;
}
