import { useState } from 'react';
import { SiteChrome } from './components/SiteChrome';
import { AnalysisScreen } from './features/analise/screens/AnalysisScreen';
import { HistoryScreen } from './features/historico/screens/HistoryScreen';
import { AnalysisModal } from './features/detalhe/components/AnalysisModal';
import { LoginScreen } from './features/auth/screens/LoginScreen';
import { FieldsScreen } from './features/talhoes/screens/FieldsScreen';
import { FieldDetailScreen } from './features/talhao/screens/FieldDetailScreen';
import { FieldCheckScreen } from './features/campo/screens/FieldCheckScreen';
import { CommunityScreen } from './features/comunidade/screens/CommunityScreen';
import { SeasonReportScreen } from './features/relatorio/screens/SeasonReportScreen';
import { SettingsScreen } from './features/opcoes/screens/SettingsScreen';
import { useNavigation } from './store/navigationStore';
import type { Analysis } from './types';

function App() {
  const route = useNavigation((s) => s.route);
  const navigate = useNavigation((s) => s.navigate);
  const [selected, setSelected] = useState<Analysis | null>(null);

  if (route === 'login') {
    return <LoginScreen navigate={navigate} />;
  }

  return (
    <SiteChrome route={route} navigate={navigate}>
      {route === 'fields' && <FieldsScreen />}
      {route === 'field' && <FieldDetailScreen />}
      {route === 'scout' && <FieldCheckScreen />}
      {route === 'report' && <SeasonReportScreen />}
      {route === 'community' && <CommunityScreen />}
      {route === 'settings' && <SettingsScreen />}
      {route === 'analysis' && <AnalysisScreen onSaved={() => navigate('history')} />}
      {route === 'history' && <HistoryScreen onOpen={setSelected} />}
      <AnalysisModal analysis={selected} onClose={() => setSelected(null)} />
    </SiteChrome>
  );
}

export default App;
