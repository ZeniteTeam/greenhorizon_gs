import { formatNumber } from '../../../utils/format';

interface SparklineProps {
  values: number[];
  expected: [number, number];
  width?: number;
  height?: number;
}

const PAD = 5;

export function Sparkline({ values, expected, width = 132, height = 40 }: SparklineProps) {
  if (values.length < 2) return null;

  const x = (i: number) => PAD + (i / (values.length - 1)) * (width - PAD * 2);
  const y = (v: number) => PAD + (1 - v) * (height - PAD * 2);
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const last = values[values.length - 1];

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={`NDVI nas últimas passagens, de ${formatNumber(values[0])} a ${formatNumber(last)}`}
    >
      <rect
        x={PAD}
        width={width - PAD * 2}
        y={y(expected[1])}
        height={y(expected[0]) - y(expected[1])}
        rx={3}
        className="fill-brand/10"
      />
      <path d={path} fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="stroke-subtle" />
      <circle cx={x(values.length - 1)} cy={y(last)} r={4} strokeWidth={2} className="fill-brand stroke-card" />
    </svg>
  );
}

export default Sparkline;
