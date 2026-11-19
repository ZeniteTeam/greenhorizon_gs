import type { InputHTMLAttributes, Ref } from 'react';

interface ToggleRowProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
  ref?: Ref<HTMLInputElement>;
}

export function ToggleRow({ label, hint, id, ref, ...input }: ToggleRowProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-heading">{label}</span>
        {hint && <span className="text-xs text-body">{hint}</span>}
      </span>
      <span className="relative inline-flex flex-shrink-0">
        <input id={id} ref={ref} type="checkbox" className="peer sr-only" {...input} />
        <span className="h-6 w-11 rounded-full bg-hairline transition peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-card shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default ToggleRow;
