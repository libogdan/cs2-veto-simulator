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
              'group relative h-28 overflow-hidden rounded-md bg-zinc-800 text-left outline-2 -outline-offset-2 outline-transparent transition',
              pick?.kind === 'pick' && 'outline-emerald-500',
              pick?.kind === 'decider' && 'outline-amber-400',
              clickable && 'cursor-pointer hover:outline-zinc-100',
              !clickable && 'cursor-default',
            )}
          >
            <img
              src={MAP_IMAGE[map]}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition',
                ban && 'opacity-30 grayscale',
              )}
            />
            <div className="absolute inset-0 bg-black/50" />

            {pick && (
              <span className="absolute right-2 top-2 text-[11px] font-semibold text-zinc-200">
                #{pick.order}
              </span>
            )}

            <div className="relative flex h-full flex-col justify-end gap-0.5 p-3">
              <div className="text-sm font-semibold text-white">{map}</div>
              {ban && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-red-300">
                  Banned by {teamName(state, ban.team)}
                </span>
              )}
              {pick?.kind === 'pick' && pick.by && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-300">
                  Picked by {teamName(state, pick.by)}
                </span>
              )}
              {pick?.kind === 'decider' && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-amber-300">
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
