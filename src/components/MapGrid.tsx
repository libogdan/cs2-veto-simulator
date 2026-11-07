import { MAP_IMAGE, MAP_POOL, type MapName } from '../lib/maps';
import { cn } from '../lib/cn';
import { teamName } from '../lib/veto';
import type { VetoState } from '../types';

interface Props {
  state: VetoState;
  /** Whether the human player can click a map right now. */
  interactive: boolean;
  onPick: (map: MapName) => void;
}

export function MapGrid({ state, interactive, onPick }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {MAP_POOL.map((map) => {
        const ban = state.actions.find((a) => a.map === map && a.action === 'ban');
        const pick = state.picks.find((p) => p.name === map);
        const available = !ban && !pick && state.remaining.includes(map);
        const clickable = interactive && available;

        return (
          <button
            key={map}
            type="button"
            disabled={!clickable}
            onClick={() => onPick(map)}
            className={cn(
              'group relative h-28 overflow-hidden rounded-xl border text-left transition',
              pick?.kind === 'pick' && 'border-emerald-500',
              pick?.kind === 'decider' && 'border-amber-400',
              !pick && 'border-zinc-700',
              clickable && 'cursor-pointer hover:-translate-y-0.5 hover:border-amber-400',
              !clickable && 'cursor-default',
            )}
          >
            <img
              src={MAP_IMAGE[map]}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition',
                ban && 'opacity-40 grayscale',
                clickable && 'group-hover:scale-105',
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

            {pick && (
              <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-zinc-200">
                #{pick.order}
              </span>
            )}

            <div className="relative flex h-full flex-col justify-end gap-1 p-3">
              <div className="text-base font-bold text-white drop-shadow">{map}</div>
              {ban && (
                <span className="w-fit rounded bg-red-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
                  Banned by {teamName(state, ban.team)}
                </span>
              )}
              {pick?.kind === 'pick' && pick.by && (
                <span className="w-fit rounded bg-emerald-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                  Picked by {teamName(state, pick.by)}
                </span>
              )}
              {pick?.kind === 'decider' && (
                <span className="w-fit rounded bg-amber-400/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                  {state.bo === 1 ? 'Last map' : 'Decider'}
                </span>
              )}
              {pick?.side && pick.sideBy && (
                <span className="text-[11px] text-zinc-300">
                  {teamName(state, pick.sideBy)}:{' '}
                  <b className={pick.side === 'CT' ? 'text-sky-300' : 'text-amber-200'}>{pick.side}</b>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
