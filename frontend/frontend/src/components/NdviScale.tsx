interface NdviScaleProps {
  value?: number;
  ideal?: [number, number];
  ticks?: number[];
}

function pct(v: number) {
  return `${Math.max(0, Math.min(1, v)) * 100}%`;
}

function fmt(v: number) {
  return v.toFixed(2).replace('.', ',');
}

export function NdviScale({ value = 0.72, ideal = [0.6, 0.8], ticks = [0, 0.6, 0.8, 1.0] }: NdviScaleProps) {
  return (
    <div className="w-full">
      <div
        className="relative"
        style={{
          height: 14,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--ndvi-gradient)',
        }}
      >
        {/* Ideal band highlight */}
        <div
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            left: pct(ideal[0]),
            width: `calc(${pct(ideal[1])} - ${pct(ideal[0])})`,
            borderRadius: 6,
            boxShadow: 'inset 0 0 0 2px var(--white)',
          }}
        />
        {/* Value marker */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: pct(value),
            transform: 'translate(-50%, -50%)',
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--white)',
            boxShadow: '0 0 0 4px var(--green-900), 0 2px 4px rgba(0,0,0,.25)',
          }}
        />
      </div>
      <div className="relative" style={{ height: 18, marginTop: 6 }}>
        {ticks.map((t) => (
          <span
            key={t}
            style={{
              position: 'absolute',
              left: pct(t),
              transform: t === 0 ? 'none' : t === 1 ? 'translateX(-100%)' : 'translateX(-50%)',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 'var(--fw-medium)',
              color: 'var(--text-body)',
            }}
          >
            {fmt(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default NdviScale;
