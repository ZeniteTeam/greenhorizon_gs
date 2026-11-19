import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { IconButton } from '../../../components/IconButton';
import type { SatelliteSample } from '../../../types/monitoring';
import { formatDayMonth } from '../../../utils/format';

interface SeasonTimelineProps {
  samples: SatelliteSample[];
  index: number;
  onChange: (index: number) => void;
  alertIndex?: number;
}

const FRAME_MS = 550;

export function SeasonTimeline({ samples, index, onChange, alertIndex }: SeasonTimelineProps) {
  const [playing, setPlaying] = useState(false);
  const lastIndex = samples.length - 1;
  const sample = samples[index];

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index >= lastIndex) setPlaying(false);
      else onChange(index + 1);
    }, FRAME_MS);
    return () => clearTimeout(timer);
  }, [playing, index, lastIndex, onChange]);

  function togglePlay() {
    if (!playing && index >= lastIndex) onChange(0);
    setPlaying((p) => !p);
  }

  return (
    <div className="flex items-center gap-4 rounded-lg bg-card p-4 shadow-card">
      <IconButton
        tone="dark"
        rounded="pill"
        size={44}
        onClick={togglePlay}
        aria-label={playing ? 'Pausar time-lapse' : 'Reproduzir time-lapse da safra'}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </IconButton>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-heading">
            {formatDayMonth(sample.date)} · {sample.dap} dias após o plantio
          </span>
          <span className="truncate text-xs text-body">{sample.stage}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={lastIndex}
            value={index}
            onChange={(e) => {
              setPlaying(false);
              onChange(Number(e.target.value));
            }}
            aria-label="Passagem do satélite"
            aria-valuetext={`${formatDayMonth(sample.date)}, ${sample.stage}`}
            className="w-full accent-brand"
          />
          {alertIndex !== undefined && (
            <span
              className="pointer-events-none absolute -top-1 size-2 -translate-x-1/2 rounded-full bg-zone"
              style={{ left: `${(alertIndex / lastIndex) * 100}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex justify-between text-xs text-subtle">
          <span>{formatDayMonth(samples[0].date)}</span>
          <span>{formatDayMonth(samples[lastIndex].date)}</span>
        </div>
      </div>
    </div>
  );
}

export default SeasonTimeline;
