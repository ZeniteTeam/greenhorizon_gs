import type { ReactNode } from 'react';
import { Card } from '../../../components/Card';
import { StepBadge } from '../../../components/StepBadge';
import type { StepState } from '../../../types';

interface ScoutStepProps {
  n: number;
  state: StepState;
  title: string;
  summary?: string;
  children?: ReactNode;
}

/** One step of the field check; collapses to its summary once done. */
export function ScoutStep({ n, state, title, summary, children }: ScoutStepProps) {
  return (
    <Card padding={20} className={`flex flex-col gap-4 ${state === 'idle' ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <StepBadge n={n} state={state} size={32} />
        <div className="flex min-w-0 flex-col">
          <h2 className="text-base font-semibold text-heading">{title}</h2>
          {state === 'done' && summary && <span className="truncate text-sm text-body">{summary}</span>}
        </div>
      </div>
      {state === 'active' && children}
    </Card>
  );
}

export default ScoutStep;
