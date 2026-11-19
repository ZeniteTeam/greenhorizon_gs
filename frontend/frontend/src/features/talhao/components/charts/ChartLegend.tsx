export type LegendKey = 'line' | 'band' | 'bar' | 'tick' | 'gap';

export interface LegendItem {
  label: string;
  key: LegendKey;
  /** Tailwind background class carrying the series color. */
  colorClass: string;
}

const KEY_SHAPE: Record<LegendKey, string> = {
  line: 'h-0.5 w-4 rounded-full',
  band: 'h-3 w-4 rounded-sm',
  bar: 'size-3 rounded-sm',
  tick: 'h-0.5 w-4',
  gap: 'h-3 w-1.5',
};

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-body">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={`${KEY_SHAPE[item.key]} ${item.colorClass}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export default ChartLegend;
