import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { IconButtonTone } from '../types';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  tone?: IconButtonTone;
  size?: number;
  rounded?: 'md' | 'pill';
}

const tones: Record<IconButtonTone, React.CSSProperties> = {
  light: { background: 'var(--white)',        color: 'var(--gray-800)', boxShadow: 'var(--shadow-card)' },
  tint:  { background: 'var(--surface-tint)', color: 'var(--text-on-tint)', boxShadow: 'var(--hairline-tint)' },
  dark:  { background: 'var(--surface-dark)', color: 'var(--white)' },
  plain: { background: 'transparent',          color: 'var(--text-body)' },
};

export function IconButton({
  children,
  tone = 'light',
  size = 40,
  rounded = 'md',
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const t = tones[tone];
  const radius = rounded === 'pill' ? 'var(--radius-pill)' : 'var(--radius-md)';

  return (
    <button
      type="button"
      disabled={disabled}
      className="gh-iconbtn inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: 'none',
        borderRadius: radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        flexShrink: 0,
        ...t,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default IconButton;
