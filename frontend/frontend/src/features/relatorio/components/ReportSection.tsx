import type { ReactNode } from 'react';

export function ReportSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex break-inside-avoid flex-col gap-3">
      <h2 className="border-b border-hairline pb-2 text-base font-bold text-section">{title}</h2>
      {children}
    </section>
  );
}

export function ReportFacts({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="text-xs text-subtle">{item.label}</dt>
          <dd className="text-sm font-semibold text-heading">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
