import type { LucideIcon } from 'lucide-react';

export interface TabItem {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export function MobileTabBar({ items }: { items: TabItem[] }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-[900] grid grid-cols-4 border-t border-hairline bg-card pb-[env(safe-area-inset-bottom)] md:hidden print:hidden"
    >
      {items.map(({ label, icon: Icon, active, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          aria-current={active ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${active ? 'text-brand' : 'text-subtle'}`}
        >
          <Icon size={22} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}

export default MobileTabBar;
