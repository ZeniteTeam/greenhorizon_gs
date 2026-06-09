import type { ReactNode } from 'react';

interface Item {
    id: number;
    descricao: string;  
}

interface RecommendationListProps {
  title?: string;
  icon?: ReactNode;
  items: Item[];
  ordered?: boolean;
}

export function RecommendationList({ title, icon, items, ordered = false }: RecommendationListProps) {
  console.log(items)
  return (
    <div className="flex flex-col gap-4">
      {(title || icon) && (
        <div className="flex items-center gap-3">
          {icon && <span className="flex" style={{ color: 'var(--green-700)' }}>{icon}</span>}
          {title && (
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--fw-semibold)',
                fontSize: 20,
                color: 'var(--text-heading)',
              }}
            >
              {title}
            </h3>
          )}
        </div>
      )}
      <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span
              className="flex-shrink-0"
              style={{
                marginTop: 7,
                width: ordered ? 'auto' : 7,
                height: ordered ? 'auto' : 7,
                minWidth: ordered ? 20 : undefined,
                borderRadius: '50%',
                background: ordered ? 'transparent' : 'var(--green-600)',
                color: ordered ? 'var(--green-700)' : undefined,
                fontFamily: ordered ? 'var(--font-sans)' : undefined,
                fontWeight: ordered ? 'var(--fw-bold)' : undefined,
                fontSize: ordered ? 14 : undefined,
              }}
            >
              {ordered ? `${i + 1}.` : ''}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 'var(--fw-regular)',
                fontSize: 16,
                lineHeight: 1.4,
                color: 'var(--text-body)',
              }}
            >
              {item.descricao}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationList;
