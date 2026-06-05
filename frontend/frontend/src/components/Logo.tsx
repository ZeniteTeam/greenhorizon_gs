interface LogoProps {
  tone?: 'onDark' | 'onLight';
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ tone = 'onDark', size = 28, showWordmark = true }: LogoProps) {
  const onDark = tone === 'onDark';
  const wordColor = onDark ? 'var(--white)' : 'var(--green-900)';
  const tile = onDark ? 'var(--green-700)' : 'var(--green-100)';
  const mark = onDark ? 'var(--white)' : 'var(--green-700)';
  const tileSize = Math.round(size * 1.35);

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center flex-shrink-0"
        style={{
          width: tileSize,
          height: tileSize,
          borderRadius: Math.round(tileSize * 0.3),
          background: tile,
        }}
      >
        <svg
          width={size * 0.72}
          height={size * 0.72}
          viewBox="0 0 24 24"
          fill="none"
          stroke={mark}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 20h10" />
          <path d="M10 20c5.5-2.5.8-6.4 3-10" />
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
          <path d="M14.1 6c-.9 1.2-1.5 2.5-1.7 4.2 2-.4 3.5-.4 4.8.3 1.2.6 2.3 1.9 3 4.2-2.8.5-4.4 0-5.5-.8" />
        </svg>
      </span>
      {showWordmark && (
        <span
          className="whitespace-nowrap"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 'var(--fw-bold)',
            fontSize: size,
            lineHeight: 1,
            letterSpacing: 'var(--ls-tight)',
            color: wordColor,
          }}
        >
          Green Horizon
        </span>
      )}
    </span>
  );
}

export default Logo;
