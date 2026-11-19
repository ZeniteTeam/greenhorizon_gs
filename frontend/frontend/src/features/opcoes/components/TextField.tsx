import type { InputHTMLAttributes, Ref } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ id, label, error, ref, ...input }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-heading">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={`h-12 rounded-md bg-card px-4 text-base text-heading ring-2 outline-none transition focus:ring-brand ${
          error ? 'ring-alert' : 'ring-hairline'
        }`}
        {...input}
      />
      {error && <span className="text-xs text-alert">{error}</span>}
    </div>
  );
}

export default TextField;
