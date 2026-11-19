import type { ReactNode } from 'react';
import { History, LandPlot, Settings, Users } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileTabBar, type TabItem } from './MobileTabBar';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import { useAuthStore } from '../store/authStore';
import { initials } from '../utils/format';
import type { NavRoute } from '../types';

interface SiteChromeProps {
  route: NavRoute;
  navigate: (route: NavRoute) => void;
  children: ReactNode;
}

const FIELD_ROUTES: NavRoute[] = ['fields', 'field', 'scout', 'report', 'analysis'];

export function SiteChrome({ route, navigate, children }: SiteChromeProps) {
  const username = useAuthStore((s) => s.username) ?? 'Produtor';
  const inFields = FIELD_ROUTES.includes(route);

  const links = [
    { label: 'Talhões', active: inFields, onClick: () => navigate('fields') },
    { label: 'Comunidade', active: route === 'community', onClick: () => navigate('community') },
    { label: 'Histórico', active: route === 'history', onClick: () => navigate('history') },
  ];

  const tabs: TabItem[] = [
    { label: 'Talhões', icon: LandPlot, active: inFields, onClick: () => navigate('fields') },
    { label: 'Comunidade', icon: Users, active: route === 'community', onClick: () => navigate('community') },
    { label: 'Histórico', icon: History, active: route === 'history', onClick: () => navigate('history') },
    { label: 'Ajustes', icon: Settings, active: route === 'settings', onClick: () => navigate('settings') },
  ];

  const trailing = (
    <>
      <NotificationBell />
      <button
        type="button"
        onClick={() => navigate('settings')}
        aria-label="Configurações da conta"
        className={`flex items-center gap-2 rounded-full p-1 transition hover:bg-white/15 md:py-1.5 md:pr-3.5 md:pl-1.5 ${
          route === 'settings' ? 'bg-white/20' : 'bg-white/10'
        }`}
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-green-950">
          {initials(username)}
        </span>
        <span className="hidden text-[13px] font-medium text-white md:inline">{username}</span>
      </button>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-page print:bg-white">
      <Navbar links={links} trailing={trailing} />
      <main className="mx-auto w-full max-w-(--container) flex-1 px-4 pt-8 pb-28 sm:px-6 md:pb-14 print:p-0">
        {children}
      </main>
      <footer className="hidden bg-dark py-8 text-white/70 md:block print:hidden">
        <p className="mx-auto max-w-(--container) px-6 text-center text-[13px]">© 2026 Green Horizon</p>
      </footer>
      <MobileTabBar items={tabs} />
    </div>
  );
}

export default SiteChrome;
