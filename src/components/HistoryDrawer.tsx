import { useEffect } from 'react';
import { cn } from '../lib/cn';
import { fmtDate } from '../lib/format';
import { computeSeries, mapWinner } from '../lib/series';
import type { MatchRecord, Team } from '../types';
import { ConfirmButton } from './ConfirmButton';

interface Props {
  open: boolean;
  items: MatchRecord[];
  storageOk: boolean;
  onClose: () => void;
  onOpenItem: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

const nameOf = (r: MatchRecord, t: Team | null): string =>
  t === 'A' ? r.teamA : t === 'B' ? r.teamB : '';

export function HistoryDrawer({
  open,
  items,
  storageOk,
  onClose,
  onOpenItem,
  onDelete,
  onClear,
}: Props) {
  // Close on Escape + lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/55 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        aria-hidden={!open}
        aria-label="Match history"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-zinc-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-[transform,visibility] duration-200',
          open ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-base font-semibold">
            Match history
            <span className="text-xs font-medium text-zinc-500">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close history"
            className="size-8 rounded-md text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            ✕
          </button>
        </header>

        {!storageOk && (
          <div className="mx-4 mt-3 rounded-md bg-zinc-800 px-3 py-2 text-xs text-amber-400">
            Browser storage isn&apos;t available here, so history will be lost when you close this page.
          </div>
        )}

        {items.length > 0 && (
          <div className="flex justify-end px-4 pt-3">
            <ConfirmButton label="Clear all history" confirmLabel="Confirm clear all?" onConfirm={onClear} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3">
          {items.length === 0 ? (
            <p className="px-2 py-10 text-center text-sm leading-relaxed text-zinc-500">
              No matches yet.
              <br />
              Finish a veto and it will be saved here automatically.
            </p>
          ) : (
            items.map((rec) => (
              <HistoryItem
                key={rec.id}
                rec={rec}
                onOpen={() => onOpenItem(rec.id)}
                onDelete={() => onDelete(rec.id)}
              />
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function HistoryItem({
  rec,
  onOpen,
  onDelete,
}: {
  rec: MatchRecord;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const s = computeSeries(rec);
  const scored = rec.maps.some((m) => mapWinner(m) !== null);

  return (
    <article className="mb-3 rounded-md bg-zinc-800/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="break-words font-medium">
            {rec.teamA} <span className="mx-0.5 text-xs font-medium text-zinc-500">vs</span> {rec.teamB}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {fmtDate(rec.createdAt)} ·{' '}
            <span className="text-[11px] font-medium text-zinc-400">
              BO{rec.bo}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-semibold text-zinc-100">
            {scored ? `${s.wa}–${s.wb}` : 'no score'}
          </div>
          {s.winner && (
            <div className="max-w-32 break-words text-[11px] font-medium text-emerald-400">
              Winner: {nameOf(rec, s.winner)}
            </div>
          )}
        </div>
      </div>

      <div className="my-3 flex flex-col gap-1.5">
        {rec.maps.map((m) => (
          <div
            key={m.order}
            className="flex items-center gap-2 rounded bg-zinc-900 px-2.5 py-1.5 text-sm"
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded bg-zinc-700 text-[11px] font-semibold text-zinc-100">
              {m.order}
            </span>
            <span className="font-medium">{m.name}</span>
            <span className="min-w-0 flex-1 text-[11px] text-zinc-500">
              {m.kind === 'decider'
                ? rec.bo === 1
                  ? 'last map'
                  : 'decider'
                : `picked by ${nameOf(rec, m.by)}`}{' '}
              · {nameOf(rec, m.sideBy)}: {m.side}
            </span>
            {!m.played ? (
              <span className="text-[11px] font-semibold uppercase text-red-400">not played</span>
            ) : m.scoreA !== null && m.scoreB !== null ? (
              <b>
                {m.scoreA}:{m.scoreB}
              </b>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs leading-relaxed">
        <span className="text-zinc-500">Bans:</span>{' '}
        {rec.bans.length === 0
          ? '—'
          : rec.bans.map((b, i) => (
              <span key={i}>
                {i > 0 && ', '}
                {b.map} <span className="text-zinc-500">({nameOf(rec, b.team)})</span>
              </span>
            ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
        >
          Open / edit scores
        </button>
        <ConfirmButton label="Delete" confirmLabel="Confirm delete?" onConfirm={onDelete} />
      </div>
    </article>
  );
}
