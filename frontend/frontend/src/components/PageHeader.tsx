import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, leading }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        {leading}
        <span className="gh-eyebrow text-brand">{eyebrow}</span>
        <h1 className="text-3xl font-bold tracking-tight text-section md:text-4xl">{title}</h1>
        {description && <p className="max-w-2xl text-base leading-snug text-body">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export default PageHeader;
