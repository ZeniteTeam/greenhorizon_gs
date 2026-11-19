import type { ReactNode } from 'react';
import { Logo } from './Logo';
import type { NavLink } from '../types';

interface NavbarProps {
  links: NavLink[];
  trailing?: ReactNode;
}

export function Navbar({ links, trailing }: NavbarProps) {
  return (
    <header className="sticky top-0 z-[900] flex h-(--navbar-h) w-full items-center bg-dark print:hidden">
      <div className="mx-auto flex w-full max-w-(--container) items-center justify-between gap-6 px-4 sm:px-6">
        <span className="flex-shrink-0 lg:hidden">
          <Logo tone="onDark" size={24} showWordmark={false} />
        </span>
        <span className="hidden flex-shrink-0 lg:block">
          <Logo tone="onDark" size={24} />
        </span>
        <nav className="hidden min-w-0 flex-1 items-center justify-end gap-7 whitespace-nowrap md:flex">
          {links.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={l.onClick}
              aria-current={l.active ? 'page' : undefined}
              className={`border-b-2 pb-0.5 text-[15px] transition ${
                l.active ? 'border-green-400 font-semibold text-white' : 'border-transparent font-medium text-white/65 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-shrink-0 items-center gap-2">{trailing}</div>
      </div>
    </header>
  );
}

export default Navbar;
