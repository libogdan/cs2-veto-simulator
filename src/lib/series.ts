import type { Format, MatchMap, MatchRecord, Team } from '../types';

export const winsNeeded = (bo: Format): number => Math.floor(bo / 2) + 1;

/** Winner of a single map, or null if not played / not scored / tied. */
export function mapWinner(m: MatchMap): Team | null {
  if (!m.played || m.scoreA === null || m.scoreB === null) return null;
  if (m.scoreA > m.scoreB) return 'A';
  if (m.scoreB > m.scoreA) return 'B';
  return null;
}

/** Series score counting only the first `upTo` maps (all by default). */
export function computeSeries(rec: MatchRecord, upTo: number = rec.maps.length) {
  let wa = 0;
  let wb = 0;
  for (const m of rec.maps.slice(0, upTo)) {
    const w = mapWinner(m);
    if (w === 'A') wa++;
    else if (w === 'B') wb++;
  }
  const need = winsNeeded(rec.bo);
  const winner: Team | null = wa >= need ? 'A' : wb >= need ? 'B' : null;
  return { wa, wb, need, winner };
}

export const parseScore = (v: string): number | null => {
  if (v === '') return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 99) : null;
};
