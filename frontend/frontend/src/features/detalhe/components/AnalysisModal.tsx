import { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../../components/IconButton';
import { ResultDashboard } from '../../analise/components/ResultDashboard';
import type { Analysis } from '../../../types';

interface AnalysisModalProps {
  analysis: Analysis | null;
  onClose: () => void;
}

export function AnalysisModal({ analysis: a, onClose }: AnalysisModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!a) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto"
      style={{
        background: 'rgba(3,35,24,0.45)',
        backdropFilter: 'blur(4px)',
        padding: '48px 24px',
      }}
    >
      <div
        className="gh-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1040px, 100%)',
          background: 'var(--bg-page)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Dark header */}
        <div
          className="flex items-center justify-between gap-4"
          style={{
            background: 'var(--surface-dark)',
            padding: '22px 28px',
          }}
        >
          <div className="flex items-center gap-4">
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.10)',
              }}
            >
              <img src={a.cropIcon} alt="" width={30} height={30} className="object-contain" />
            </span>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 'var(--fw-bold)',
                  fontSize: 20,
                  color: 'var(--white)',
                }}
              >
                {a.crop} · {a.area}
              </div>
              <div
                className="mt-0.5"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {a.location} · {a.date}
              </div>
            </div>
          </div>
          <IconButton tone="dark" rounded="pill" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </div>

        {/* Map strip */}
        <div
          style={{
            height: 180,
            background: 'url(/imagery/hero-map.png) center / cover no-repeat',
          }}
        />

        {/* Body */}
        <div style={{ padding: 28 }}>
          <ResultDashboard analysis={a} compact />
        </div>
      </div>
    </div>
  );
}

export default AnalysisModal;
