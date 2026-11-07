import { MAP_POOL, type MapName } from './maps';
import type {
  Format,
  MatchRecord,
  Side,
  Step,
  StepAction,
  Team,
  VetoConfig,
  VetoState,
} from '../types';

/*
 * Veto formats (7-map pool, one map is always left over):
 *   BO1: ban x6                           -> 1 map left (the map played)
 *   BO3: ban, ban, pick, pick, ban, ban   -> decider
 *   BO5: ban, ban, pick, pick, pick, pick -> decider
 * Teams alternate every step. The team that did NOT pick a map chooses its
 * starting side; the decider's side is a coinflip.
 */
const ACTIONS: Record<Format, StepAction[]> = {
  1: ['ban', 'ban', 'ban', 'ban', 'ban', 'ban'],
  3: ['ban', 'ban', 'pick', 'pick', 'ban', 'ban'],
  5: ['ban', 'ban', 'pick', 'pick', 'pick', 'pick'],
};

export const otherTeam = (t: Team): Team => (t === 'A' ? 'B' : 'A');

export const teamName = (s: Pick<VetoState, 'teamA' | 'teamB'>, t: Team): string =>
  t === 'A' ? s.teamA : s.teamB;

export function buildSequence(bo: Format, first: Team): Step[] {
  return ACTIONS[bo].map((action, i) => ({
    action,
    team: i % 2 === 0 ? first : otherTeam(first),
  }));
}

export function createVeto(cfg: VetoConfig): VetoState {
  const firstBan: Team =
    cfg.first === 'coinflip' ? (Math.random() < 0.5 ? 'A' : 'B') : cfg.first;
  const base = { teamA: cfg.teamA, teamB: cfg.teamB };
  return {
    bo: cfg.bo,
    ...base,
    firstBan,
    sequence: buildSequence(cfg.bo, firstBan),
    stepIndex: 0,
    remaining: [...MAP_POOL],
    actions: [],
    picks: [],
    pendingSide: null,
    log: [`${teamName(base, firstBan)} bans first.`],
  };
}

export const currentStep = (s: VetoState): Step | null => s.sequence[s.stepIndex] ?? null;

/** Every step done, nothing pending and the last map has been assigned. */
export const isFinished = (s: VetoState): boolean =>
  s.stepIndex >= s.sequence.length && !s.pendingSide && s.remaining.length === 0;

/** Steps are done and exactly one map is left over -> it becomes the decider. */
export const needsDecider = (s: VetoState): boolean =>
  s.stepIndex >= s.sequence.length && !s.pendingSide && s.remaining.length === 1;

/** Current team bans/picks `map`. Ignores invalid input. */
export function applyAct(s: VetoState, map: MapName): VetoState {
  const step = currentStep(s);
  if (!step || s.pendingSide || !s.remaining.includes(map)) return s;

  const next: VetoState = {
    ...s,
    stepIndex: s.stepIndex + 1,
    remaining: s.remaining.filter((m) => m !== map),
    actions: [...s.actions, { team: step.team, action: step.action, map }],
    log: [
      ...s.log,
      `${teamName(s, step.team)} ${step.action === 'ban' ? 'banned' : 'picked'} ${map}.`,
    ],
  };

  if (step.action === 'ban') return next;

  return {
    ...next,
    picks: [
      ...s.picks,
      { order: s.picks.length + 1, name: map, kind: 'pick', by: step.team, side: null, sideBy: null },
    ],
    pendingSide: { map, chooser: otherTeam(step.team) },
  };
}

/** The pending chooser selects a starting side for the freshly picked map. */
export function applySide(s: VetoState, side: Side): VetoState {
  const p = s.pendingSide;
  if (!p) return s;
  return {
    ...s,
    pendingSide: null,
    picks: s.picks.map((m) => (m.name === p.map ? { ...m, side, sideBy: p.chooser } : m)),
    log: [...s.log, `${teamName(s, p.chooser)} chose to start ${side} on ${p.map}.`],
  };
}

/** Assigns the leftover map. Randomness is passed in so the reducer stays pure. */
export function applyDecider(s: VetoState, side: Side, chooser: Team): VetoState {
  if (!needsDecider(s)) return s;
  const map = s.remaining[0];
  return {
    ...s,
    remaining: [],
    picks: [
      ...s.picks,
      { order: s.picks.length + 1, name: map, kind: 'decider', by: null, side, sideBy: chooser },
    ],
    log: [
      ...s.log,
      `${map} remains as the ${s.bo === 1 ? 'last map' : 'decider'}.`,
      `Coinflip: ${teamName(s, chooser)} starts ${side}.`,
    ],
  };
}

/** Snapshot of a finished veto, ready to be saved to history. */
export function buildRecord(s: VetoState): MatchRecord {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: Date.now(),
    bo: s.bo,
    teamA: s.teamA,
    teamB: s.teamB,
    firstBan: s.firstBan,
    bans: s.actions
      .filter((a) => a.action === 'ban')
      .map((a) => ({ team: a.team, map: a.map })),
    maps: s.picks.map((p) => ({
      order: p.order,
      name: p.name,
      kind: p.kind,
      by: p.by,
      side: p.side ?? 'CT',
      sideBy: p.sideBy ?? 'A',
      scoreA: null,
      scoreB: null,
      played: true,
    })),
  };
}
