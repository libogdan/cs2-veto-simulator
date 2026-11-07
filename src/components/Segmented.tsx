import { cn } from '../lib/cn';

interface Props<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-zinc-700">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 border-r border-zinc-700 px-3 py-2 text-sm font-semibold transition last:border-r-0',
            o.value === value
              ? 'bg-amber-400 text-zinc-900'
              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
