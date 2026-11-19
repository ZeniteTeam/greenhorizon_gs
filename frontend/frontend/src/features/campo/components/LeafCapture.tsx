import { useEffect, useRef, useState } from 'react';
import { Camera, ImageIcon, ScanLine } from 'lucide-react';
import { Button } from '../../../components/Button';

const SAMPLE_PHOTO_URL = '/imagery/leaf-rust-sample.svg';

interface Photo {
  blob: Blob;
  url: string;
  isSample: boolean;
}

interface LeafCaptureProps {
  analyzing: boolean;
  onAnalyze: (photo: Blob) => void;
}

export function LeafCapture({ analyzing, onAnalyze }: LeafCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setPhoto({ blob: file, url: URL.createObjectURL(file), isSample: false });
  }

  async function pickSample() {
    const blob = await fetch(SAMPLE_PHOTO_URL).then((r) => r.blob());
    setPhoto({ blob, url: URL.createObjectURL(blob), isSample: true });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {photo ? (
        <figure className={`relative overflow-hidden rounded-md ${analyzing ? 'gh-scan' : ''}`}>
          <img src={photo.url} alt="Foto da folha enviada" className="aspect-[4/3] w-full object-cover" />
          {photo.isSample && (
            <figcaption className="absolute bottom-2 left-2 rounded-full bg-dark/75 px-2.5 py-1 text-[11px] font-semibold text-white">
              Foto de exemplo (ilustração)
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-tint-border bg-wash text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-tint text-brand">
            <Camera size={26} aria-hidden="true" />
          </span>
          <p className="max-w-60 text-sm leading-snug text-body">
            Fotografe a parte de baixo de uma folha do terço inferior da planta, de perto e com luz natural.
          </p>
        </div>
      )}

      {photo ? (
        <div className="flex flex-col gap-2">
          <Button
            fullWidth
            disabled={analyzing}
            iconLeft={analyzing ? undefined : <ScanLine size={18} />}
            onClick={() => onAnalyze(photo.blob)}
          >
            {analyzing ? 'Analisando a folha…' : 'Analisar foto'}
          </Button>
          <Button variant="ghost" fullWidth disabled={analyzing} onClick={() => inputRef.current?.click()}>
            Tirar outra foto
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button fullWidth iconLeft={<Camera size={18} />} onClick={() => inputRef.current?.click()}>
            Tirar foto da folha
          </Button>
          <Button variant="ghost" fullWidth iconLeft={<ImageIcon size={18} />} onClick={pickSample}>
            Usar foto de exemplo
          </Button>
        </div>
      )}
    </div>
  );
}

export default LeafCapture;
