import type { ReactNode } from 'react';
import { Logo } from './Logo';
import type { NavLink } from '../types';

interface NavbarProps {
  links: NavLink[];
  trailing?: ReactNode;
}

export function Navbar({ links, trailing }: NavbarProps) {
  return (
    <header
      className="flex items-center w-full"
      style={{
        height: 'var(--navbar-h)',
        background: 'var(--surface-dark)',
      }}
    >
      <div
        className="w-full flex items-center justify-between gap-6 mx-auto px-6"
        style={{ maxWidth: 'var(--container)' }}
      >
        <Logo tone="onDark" size={24} />
        <nav className="flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                l.onClick();
              }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: l.active ? 'var(--fw-semibold)' : 'var(--fw-medium)',
                fontSize: 15,
                color: l.active ? 'var(--white)' : 'rgba(255,255,255,0.66)',
                paddingBottom: 2,
                borderBottom: l.active ? '2px solid var(--green-400)' : '2px solid transparent',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </a>
          ))}
          {trailing}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
