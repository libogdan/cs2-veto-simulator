import type { MapName } from '../lib/maps';
import { currentStep, isFinished, teamName } from '../lib/veto';
import type { Side, VetoState } from '../types';
import { MapGrid } from './MapGrid';

interface Props {
  state: VetoState;
  onPick: (map: MapName) => void;
  onSide: (side: Side) => void;
  onReset: () => void;
}

export function VetoPanel({ state, onPick, onSide, onReset }: Props) {
  const step = currentStep(state);
  const pending = state.pendingSide;
  const finished = isFinished(state);
  const youChooseSide = pending?.chooser === 'A';
  const yourTurn = !!step && step.team === 'A' && !pending;

  let title: string;
  let sub = '';
  if (finished) {
    title = 'Veto complete';
    sub = 'Scroll down for the map order and enter scores. The match is saved to History.';
  } else if (pending) {
    title = youChooseSide
      ? `Choose your starting side on ${pending.map}`
      : `${teamName(state, 'B')} is choosing a side…`;
  } else if (step) {
    title = `${teamName(state, step.team)} to ${step.action.toUpperCase()} a map`;
    sub = yourTurn ? `Click a map to ${step.action} it.` : 'Deciding…';
  } else {
    title = 'Deciding the last map…';
  }

  return (
    <section className="rounded-lg bg-zinc-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{title}</div>
          {sub && <div className="mt-0.5 text-sm text-zinc-500">{sub}</div>}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100"
        >
          New match
        </button>
      </div>

      {youChooseSide && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => onSide('CT')}
            className="flex-1 rounded-md bg-zinc-800 py-2.5 text-sm font-medium text-sky-300 transition hover:bg-zinc-700"
          >
            Start on CT side
          </button>
          <button
            type="button"
            onClick={() => onSide('T')}
            className="flex-1 rounded-md bg-zinc-800 py-2.5 text-sm font-medium text-amber-300 transition hover:bg-zinc-700"
          >
            Start on T side
          </button>
        </div>
      )}

      <div className="mt-4">
        <MapGrid state={state} interactive={yourTurn} onPick={onPick} />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs text-zinc-500">
          Veto log
        </div>
        <ul className="max-h-40 divide-y divide-zinc-800 overflow-y-auto text-sm text-zinc-400">
          {[...state.log].reverse().map((line, i) => (
            <li key={`${state.log.length - i}`} className="py-1.5">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
