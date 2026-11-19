import { CalendarCheck, Microscope, NotebookPen, Radar, Satellite, Sprout, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../../../../components/Card';
import { QueryState } from '../../../../components/QueryState';
import type { FieldEventKind } from '../../../../types/monitoring';
import { formatFullDate } from '../../../../utils/format';
import { useFieldEvents } from '../../hooks/useFieldExtras';
import { NoteForm } from './NoteForm';

const KIND_META: Record<FieldEventKind, { icon: LucideIcon; iconClass: string }> = {
  planting: { icon: Sprout, iconClass: 'bg-good-bg text-good' },
  pass: { icon: Satellite, iconClass: 'bg-info-bg text-info' },
  zone: { icon: Radar, iconClass: 'bg-zone-bg text-zone' },
  diagnosis: { icon: Microscope, iconClass: 'bg-alert-bg text-alert' },
  dismissal: { icon: XCircle, iconClass: 'bg-hairline text-heading' },
  visit: { icon: CalendarCheck, iconClass: 'bg-tint text-brand' },
  note: { icon: NotebookPen, iconClass: 'bg-warn-bg text-warn' },
};

export function FieldLog({ fieldId }: { fieldId: string }) {
  const { data, isLoading, error, refetch } = useFieldEvents(fieldId);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <Card padding={24} className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-heading">Registro do talhão</h2>
        <QueryState loading={isLoading} error={error} onRetry={() => refetch()} />
        {data && (
          <ol className="relative flex flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-px before:bg-hairline">
            {data.map((event) => {
              const meta = KIND_META[event.kind];
              const Icon = meta.icon;
              return (
                <li key={event.id} className="relative flex gap-4">
                  <span className={`z-10 flex size-9 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-card ${meta.iconClass}`}>
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5 pt-1">
                    <span className="text-xs text-subtle">
                      {formatFullDate(event.date)}
                      {event.author && ` · ${event.author}`}
                    </span>
                    <span className="text-sm font-semibold text-heading">{event.title}</span>
                    {event.description && <span className="text-sm leading-snug text-body">{event.description}</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
      <Card padding={24} className="h-fit">
        <NoteForm fieldId={fieldId} />
      </Card>
    </div>
  );
}

export default FieldLog;
