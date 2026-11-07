import { useState } from 'react';
import type { FirstBan, Format, VetoConfig } from '../types';
import { Segmented } from './Segmented';

interface Props {
  onStart: (cfg: VetoConfig) => void;
}

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400';
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500';

export function SetupPanel({ onStart }: Props) {
  const [teamA, setTeamA] = useState('You');
  const [teamB, setTeamB] = useState('Opponent');
  const [bo, setBo] = useState<Format>(3);
  const [first, setFirst] = useState<FirstBan>('coinflip');

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Your team name</span>
          <input
            className={inputClass}
            value={teamA}
            maxLength={20}
            onChange={(e) => setTeamA(e.target.value)}
          />
        </label>
        <label>
          <span className={labelClass}>Opponent name</span>
          <input
            className={inputClass}
            value={teamB}
            maxLength={20}
            onChange={(e) => setTeamB(e.target.value)}
          />
        </label>
        <div>
          <span className={labelClass}>Match format</span>
          <Segmented<Format>
            value={bo}
            onChange={setBo}
            options={[
              { value: 1, label: 'Best of 1' },
              { value: 3, label: 'Best of 3' },
              { value: 5, label: 'Best of 5' },
            ]}
          />
        </div>
        <div>
          <span className={labelClass}>Who bans first?</span>
          <Segmented<FirstBan>
            value={first}
            onChange={setFirst}
            options={[
              { value: 'coinflip', label: 'Coinflip' },
              { value: 'A', label: 'You' },
              { value: 'B', label: 'Opponent' },
            ]}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          onStart({ bo, first, teamA: teamA.trim() || 'You', teamB: teamB.trim() || 'Opponent' })
        }
        className="mt-5 w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-400 py-3 font-bold tracking-wide text-zinc-900 transition hover:brightness-110"
      >
        Start Veto
      </button>
    </section>
  );
}
