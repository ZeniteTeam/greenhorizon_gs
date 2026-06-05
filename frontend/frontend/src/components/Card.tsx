import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tint?: boolean;
  padding?: number | string;
}

export function Card({ children, tint = false, padding = 24, style, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: tint ? 'var(--surface-tint)' : 'var(--surface-card)',
        borderRadius: tint ? 'var(--radius-md)' : 'var(--radius-lg)',
        boxShadow: tint ? 'var(--hairline-tint)' : 'var(--shadow-card)',
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
