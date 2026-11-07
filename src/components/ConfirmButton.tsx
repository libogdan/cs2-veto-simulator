import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

interface Props {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/** Two-step destructive button: first click arms it, second click confirms. */
export function ConfirmButton({ label, confirmLabel, onConfirm }: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
        }
      }}
      className={cn(
        'rounded-md border px-3 py-1.5 text-xs font-semibold transition',
        armed
          ? 'border-red-600 bg-red-600 text-white'
          : 'border-red-500/50 bg-zinc-900 text-red-400 hover:border-red-400',
      )}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
