'use client';

import { useCallback, useEffect, useState } from 'react';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ResultsPanel } from './components/ResultsPanel';
import { SetupPanel } from './components/SetupPanel';
import { VetoPanel } from './components/VetoPanel';
import { useHistory } from './hooks/useHistory';
import { useVeto } from './hooks/useVeto';
import { buildRecord, isFinished } from './lib/veto';
import type { MatchMap, VetoConfig } from './types';

export default function App() {
  const history = useHistory();
  const { state, start, reset, pickMap, chooseSide } = useVeto();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const record = history.items.find((r) => r.id === currentId) ?? null;
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // When a veto finishes, save it to history once and show its results.
  const { add } = history;
  useEffect(() => {
    if (state && isFinished(state) && currentId === null) {
      const rec = buildRecord(state);
      add(rec);
      setCurrentId(rec.id);
    }
  }, [state, currentId, add]);

  const handleStart = (cfg: VetoConfig) => {
    setCurrentId(null);
    start(cfg);
  };

  const handleNew = () => {
    reset();
    setCurrentId(null);
  };

  const openFromHistory = (id: string) => {
    reset(); // abort any veto in progress
    setCurrentId(id);
    setDrawerOpen(false);
    window.scrollTo({ top: 0 });
  };

  const patchMap = (index: number, patch: Partial<MatchMap>) => {
    if (!record) return;
    history.update(record.id, (r) => ({
      ...r,
      maps: r.maps.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 text-zinc-100 antialiased">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            History
            <span className="text-xs font-semibold text-amber-400">
              {history.items.length}
            </span>
          </button>
        </div>

        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-100">
          CS2 Map Veto Simulator
        </h1>
        <p className="mb-8 mt-1 text-center text-sm text-zinc-500">
          Competitive map pick / ban — BO1, BO3 &amp; BO5
        </p>

        {!state && !record && <SetupPanel onStart={handleStart} />}

        {state && (
          <VetoPanel state={state} onPick={pickMap} onSide={chooseSide} onReset={handleNew} />
        )}

        {record && (
          <ResultsPanel
            record={record}
            storageOk={history.storageOk}
            onPatchMap={patchMap}
            onNew={handleNew}
          />
        )}
      </div>

      <HistoryDrawer
        open={drawerOpen}
        items={history.items}
        storageOk={history.storageOk}
        onClose={closeDrawer}
        onOpenItem={openFromHistory}
        onDelete={history.remove}
        onClear={history.clear}
      />
    </div>
  );
}
