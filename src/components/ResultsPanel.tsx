import { cn } from '../lib/cn';
import { fmtDate } from '../lib/format';
import { computeSeries, mapWinner, parseScore } from '../lib/series';
import type { MatchMap, MatchRecord, Team } from '../types';

interface Props {
  record: MatchRecord;
  storageOk: boolean;
  onPatchMap: (index: number, patch: Partial<MatchMap>) => void;
  onNew: () => void;
}

const nameOf = (r: MatchRecord, t: Team | null): string =>
  t === 'A' ? r.teamA : t === 'B' ? r.teamB : '';

export function ResultsPanel({ record, storageOk, onPatchMap, onNew }: Props) {
  const series = computeSeries(record);
  const scored = record.maps.some((m) => mapWinner(m) !== null);

  return (
    <section className="mt-5 rounded-lg bg-zinc-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">
            {record.teamA} vs {record.teamB}
          </div>
          <div className="mt-0.5 text-sm text-zinc-500">
            BO{record.bo} · {fmtDate(record.createdAt)} ·{' '}
            {storageOk ? 'Auto-saved to history' : 'History not persisted (browser storage unavailable)'}
          </div>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-100"
        >
          New match
        </button>
      </div>

      {/* Series score */}
      <div className="my-4 rounded-md bg-zinc-800/50 p-4 text-center">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="max-w-36 truncate font-medium">{record.teamA}</span>
          <b className={cn('text-3xl font-semibold leading-none', series.winner === 'A' && 'text-emerald-400')}>
            {series.wa}
          </b>
          <span className="text-xl text-zinc-500">–</span>
          <b className={cn('text-3xl font-semibold leading-none', series.winner === 'B' && 'text-emerald-400')}>
            {series.wb}
          </b>
          <span className="max-w-36 truncate font-medium">{record.teamB}</span>
        </div>
        <div className="mt-2 text-sm text-zinc-500">
          {series.winner ? (
            <span className="font-medium text-emerald-400">Winner: {nameOf(record, series.winner)}</span>
          ) : scored ? (
            'Series in progress'
          ) : (
            'Enter the map scores below'
          )}
        </div>
      </div>

      <div className="space-y-3">
        {record.maps.map((_, i) => (
          <MapRow key={i} record={record} index={i} onPatch={(patch) => onPatchMap(i, patch)} />
        ))}
      </div>
    </section>
  );
}

function MapRow({
  record,
  index,
  onPatch,
}: {
  record: MatchRecord;
  index: number;
  onPatch: (patch: Partial<MatchMap>) => void;
}) {
  const m = record.maps[index];
  const winner = mapWinner(m);
  const clinched = computeSeries(record, index).winner !== null;
  const noScore = m.scoreA === null && m.scoreB === null;
  const canToggle = record.bo > 1 && (m.kind === 'decider' || clinched || !m.played);
  const hint =
    m.played && clinched && noScore
      ? "The series was already decided before this map. If it wasn't played, mark it as not played."
      : '';
  const sideBy = nameOf(record, m.sideBy);

  const meta =
    m.kind === 'decider'
      ? `${record.bo === 1 ? 'Last remaining map' : 'Decider (leftover)'} · coinflip: ${sideBy}`
      : `Picked by ${nameOf(record, m.by)} · ${sideBy} chose side`;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-md bg-zinc-800/50 px-4 py-3',
        !m.played && 'opacity-65',
      )}
    >
      <div className="flex min-w-48 flex-1 items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded bg-zinc-700 text-sm font-semibold text-zinc-100">
          {m.order}
        </div>
        <div>
          <div className="font-medium">
            {m.name}
            {!m.played && (
              <span className="ml-2 align-middle text-[10px] font-semibold tracking-wide text-red-400">
                NOT PLAYED
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500">{meta}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'text-xs font-medium',
            m.side === 'CT' ? 'text-sky-300' : 'text-amber-300',
          )}
        >
          {sideBy}: {m.side}
        </span>

        <div className="flex items-start gap-2">
          <ScoreInput
            value={m.scoreA}
            label={record.teamA}
            disabled={!m.played}
            win={winner === 'A'}
            onChange={(v) => onPatch({ scoreA: v })}
          />
          <span className="pt-2 font-bold text-zinc-500">:</span>
          <ScoreInput
            value={m.scoreB}
            label={record.teamB}
            disabled={!m.played}
            win={winner === 'B'}
            onChange={(v) => onPatch({ scoreB: v })}
          />
        </div>
      </div>

      {(hint || canToggle) && (
        <div className="flex basis-full flex-wrap items-center justify-between gap-3">
          <span className="min-w-40 flex-1 text-xs text-amber-400">{hint}</span>
          {canToggle && (
            <button
              type="button"
              onClick={() =>
                m.played
                  ? onPatch({ played: false, scoreA: null, scoreB: null })
                  : onPatch({ played: true })
              }
              className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
            >
              {m.played ? 'Mark as not played' : 'Mark as played'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreInput({
  value,
  label,
  disabled,
  win,
  onChange,
}: {
  value: number | null;
  label: string;
  disabled: boolean;
  win: boolean;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="flex flex-col items-center gap-0.5">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        step={1}
        value={value ?? ''}
        disabled={disabled}
        aria-label={`${label} rounds`}
        onChange={(e) => onChange(parseScore(e.target.value))}
        className={cn(
          'w-14 rounded-md bg-zinc-800 px-1 py-1.5 text-center font-semibold outline-none ring-1 ring-transparent focus:ring-zinc-500 disabled:opacity-35',
          win ? 'text-emerald-400' : 'text-zinc-100',
        )}
      />
      <span className="max-w-18 truncate text-[11px] text-zinc-500">{label}</span>
    </label>
  );
}
