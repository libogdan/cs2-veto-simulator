import { useCallback, useEffect, useState } from 'react';
import type { MatchRecord } from '../types';

const STORE_KEY = 'cs2veto.history.v1';

function isRecord(r: unknown): r is MatchRecord {
  if (typeof r !== 'object' || r === null) return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.teamA === 'string' &&
    typeof o.teamB === 'string' &&
    Array.isArray(o.maps) &&
    Array.isArray(o.bans)
  );
}

/**
 * Match history persisted in localStorage.
 * Reads happen in an effect (not during render) so it is safe with SSR / Next.js.
 */
export function useHistory() {
  const [items, setItems] = useState<MatchRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  // Load once.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORE_KEY);
    } catch {
      setStorageOk(false);
    }
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter(isRecord));
      } catch {
        /* corrupt data: start fresh */
      }
    }
    setHydrated(true);
  }, []);

  // Save on every change (after the initial load, so we never overwrite with []).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(items));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [items, hydrated]);

  const add = useCallback((rec: MatchRecord) => setItems((p) => [rec, ...p]), []);
  const update = useCallback(
    (id: string, fn: (r: MatchRecord) => MatchRecord) =>
      setItems((p) => p.map((r) => (r.id === id ? fn(r) : r))),
    [],
  );
  const remove = useCallback((id: string) => setItems((p) => p.filter((r) => r.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  return { items, storageOk, add, update, remove, clear };
}
