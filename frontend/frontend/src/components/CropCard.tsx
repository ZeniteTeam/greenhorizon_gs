interface CropCardProps {
  label: string;
  icon: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CropCard({ label, icon, selected = false, onClick }: CropCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="gh-cropcard flex flex-col items-center justify-center gap-3"
      style={{
        width: 100,
        height: 145,
        padding: 12,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-tint)',
        boxShadow: selected ? 'var(--hairline-brand)' : 'inset 0 0 0 2px transparent',
        transition: 'box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
      }}
    >
      <img src={icon} alt="" width={54} height={54} className="object-contain" />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-medium)',
          fontSize: 16,
          color: 'var(--text-on-tint)',
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default CropCard;
