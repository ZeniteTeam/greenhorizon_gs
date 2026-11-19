import { AlertCircle, Loader2 } from 'lucide-react';
import { apiErrorMessage } from '../utils/apiError';
import { Button } from './Button';

interface QueryStateProps {
  loading: boolean;
  error: unknown;
  onRetry?: () => void;
  loadingLabel?: string;
}

/** Renders the loading / error placeholder for a query, or nothing once data is ready. */
export function QueryState({ loading, error, onRetry, loadingLabel = 'Carregando…' }: QueryStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg bg-card p-12 text-body shadow-card">
        <Loader2 size={20} className="animate-spin text-brand" aria-hidden="true" />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg bg-card p-12 text-center shadow-card">
        <AlertCircle size={28} className="text-alert" aria-hidden="true" />
        <p className="text-base text-heading">{apiErrorMessage(error, 'Não foi possível carregar os dados.')}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  return null;
}

export default QueryState;
