import type { ReactNode } from 'react';

type AlertTone = 'alert' | 'warn' | 'info' | 'good';

interface AlertBannerProps {
  tone: AlertTone;
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}

const TONE_CLASSES: Record<AlertTone, { box: string; icon: string }> = {
  alert: { box: 'bg-alert-bg', icon: 'bg-alert text-white' },
  warn: { box: 'bg-warn-bg', icon: 'bg-warn text-white' },
  info: { box: 'bg-info-bg', icon: 'bg-info text-white' },
  good: { box: 'bg-good-bg', icon: 'bg-good text-white' },
};

export function AlertBanner({ tone, icon, title, children, action }: AlertBannerProps) {
  const classes = TONE_CLASSES[tone];
  return (
    <div
      role="status"
      className={`gh-reveal flex flex-col gap-4 rounded-lg p-5 sm:flex-row sm:items-center ${classes.box}`}
    >
      <span className={`flex size-11 flex-shrink-0 items-center justify-center rounded-full ${classes.icon}`}>
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-base font-semibold text-heading">{title}</p>
        {children && <div className="text-sm leading-relaxed text-body">{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default AlertBanner;
