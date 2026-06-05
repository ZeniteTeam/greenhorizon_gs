import type { StepState } from '../types';

interface StepBadgeProps {
  n: number;
  state?: StepState;
  size?: number;
}

const states: Record<StepState, React.CSSProperties> = {
  active: { background: 'var(--green-650)', color: 'var(--white)' },
  done:   { background: 'var(--green-700)', color: 'var(--white)' },
  idle:   { background: 'var(--white)',     color: 'var(--gray-300)', boxShadow: 'inset 0 0 0 2px var(--gray-300)' },
};

export function StepBadge({ n, state = 'active', size = 39 }: StepBadgeProps) {
  const s = states[state];

  return (
    <span
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-bold)',
        fontSize: 20,
        lineHeight: 1,
        ...s,
      }}
    >
      {state === 'done' ? '✓' : n}
    </span>
  );
}

export default StepBadge;
