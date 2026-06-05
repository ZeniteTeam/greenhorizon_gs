import type { ReactNode, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export function Input({ icon, style, ...rest }: InputProps) {
  return (
    <div
      className="gh-input flex items-center gap-3"
      style={{
        height: 63,
        padding: '0 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--white)',
        boxShadow: 'var(--hairline-input)',
        transition: 'box-shadow var(--dur-fast) var(--ease-out)',
        opacity: rest.disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {icon && (
        <span className="flex flex-shrink-0" style={{ color: 'var(--gray-500)' }}>
          {icon}
        </span>
      )}
      <input
        className="flex-1 min-w-0 border-none outline-none bg-transparent"
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-regular)',
          fontSize: 16,
          lineHeight: 'var(--lh-snug)',
          color: 'var(--text-heading)',
        }}
        {...rest}
      />
    </div>
  );
}

export default Input;
