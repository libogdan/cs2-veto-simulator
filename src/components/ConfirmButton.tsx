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
        'rounded-md px-3 py-1.5 text-xs font-medium transition',
        armed
          ? 'bg-red-500 text-white'
          : 'bg-zinc-800 text-red-400 hover:bg-zinc-700',
      )}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
