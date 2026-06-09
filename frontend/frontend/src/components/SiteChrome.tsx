import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Logo } from './Logo';
import type { NavRoute } from '../types';

interface SiteChromeProps {
  route: NavRoute;
  navigate: (route: NavRoute) => void;
  children: ReactNode;
}

export function SiteChrome({ route, navigate, children }: SiteChromeProps) {
  const links = [
    { label: 'Análise',   active: route === 'analysis', onClick: () => navigate('analysis') },
    { label: 'Histórico', active: route === 'history',  onClick: () => navigate('history') },
    { label: 'Sobre',     active: false,                onClick: () => {} },
  ];

  const trailing = (
    <div
      className="flex items-center gap-2"
      style={{
        padding: '6px 14px 6px 8px',
        borderRadius: 'var(--radius-pill)',
        background: 'rgba(255,255,255,0.10)',
      }}
    >
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'var(--green-400)',
          color: 'var(--green-950)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-bold)',
          fontSize: 12,
        }}
      >
        MR
      </span>
      <span
        style={{
          color: 'var(--white)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 'var(--fw-medium)',
          fontSize: 13,
        }}
      >
        Marcos R.
      </span>
    </div>
  );

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'var(--bg-page)' }}
    >
      <Navbar links={links} trailing={trailing} />
      <main
        className="flex-1 w-full mx-auto px-6"
        style={{
          maxWidth: 'var(--container)',
          padding: '32px 24px 56px',
        }}
      >
        {children}
      </main>
      <footer style={{ background: 'var(--surface-dark)', color: 'rgba(255,255,255,0.7)', padding: '32px 0' }}>
        <div
          className="mx-auto px-6 flex items-center justify-center gap-6 flex-wrap"
          style={{ maxWidth: 'var(--container)' }}
        >
          {/* <Logo tone="onDark" size={20} /> */}
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>
            Tecnologia de análise de solo acessível para todos · © 2026 Green Horizon
          </span>
        </div>
      </footer>
    </div>
  );
}

export default SiteChrome;
