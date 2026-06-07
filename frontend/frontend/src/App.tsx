import { useState } from 'react';
import { SiteChrome } from './components/SiteChrome';
import { AnalysisScreen } from './features/analise/screens/AnalysisScreen';
import { HistoryScreen } from './features/historico/screens/HistoryScreen';
import { AnalysisModal } from './features/detalhe/components/AnalysisModal';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import type { NavRoute, Analysis } from './types';

function App() {
  const [route, setRoute] = useState<NavRoute>('login');
  const [selected, setSelected] = useState<Analysis | null>(null);

  if (route === 'login') {
    return <LoginScreen navigate={setRoute} />;
  }

  return (
    <SiteChrome route={route} navigate={setRoute}>
      {route === 'analysis' ? (
        <AnalysisScreen onSaved={() => setRoute('history')} />
      ) : (
        <HistoryScreen onOpen={setSelected} />
      )}
      <AnalysisModal analysis={selected} onClose={() => setSelected(null)} />
    </SiteChrome>
  );
}

export default App;
