import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { ButtonVariant, ButtonSize } from '../types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

const sizes: Record<ButtonSize, { height: number; padding: string; font: number }> = {
  sm: { height: 36, padding: '0 16px', font: 14 },
  md: { height: 48, padding: '0 22px', font: 16 },
  lg: { height: 59, padding: '0 28px', font: 20 },
};

const variants: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: 'var(--accent)',       color: 'var(--white)' },
  secondary: { background: 'var(--surface-tint)', color: 'var(--text-on-tint)', boxShadow: 'var(--hairline-tint)' },
  ghost:     { background: 'transparent',          color: 'var(--text-brand)' },
  dark:      { background: 'var(--surface-dark)',  color: 'var(--white)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const s = sizes[size];
  const v = variants[variant];

  return (
    <button
      type="button"
      disabled={disabled}
      data-variant={variant}
      className="gh-btn inline-flex items-center justify-center gap-2.5"
      style={{
        height: s.height,
        padding: s.padding,
        width: fullWidth ? '100%' : 'auto',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-bold)',
        fontSize: s.font,
        lineHeight: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

export default Button;
