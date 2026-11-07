import type { MapName } from './lib/maps';

/** 'A' is you, 'B' is the (random) opponent. */
export type Team = 'A' | 'B';
export type Side = 'CT' | 'T';
export type Format = 1 | 3 | 5;
export type FirstBan = 'coinflip' | Team;
export type StepAction = 'ban' | 'pick';

export interface Step {
  team: Team;
  action: StepAction;
}

export interface VetoAction {
  team: Team;
  action: StepAction;
  map: MapName;
}

export interface PickedMap {
  order: number;
  name: MapName;
  kind: 'pick' | 'decider';
  /** Team that picked the map (null for the decider). */
  by: Team | null;
  /** Starting side, null until it has been chosen. */
  side: Side | null;
  /** Team that starts on `side` (the non-picking team, or the coinflip winner). */
  sideBy: Team | null;
}

export interface VetoConfig {
  bo: Format;
  teamA: string;
  teamB: string;
  first: FirstBan;
}

export interface VetoState {
  bo: Format;
  teamA: string;
  teamB: string;
  firstBan: Team;
  sequence: Step[];
  stepIndex: number;
  remaining: MapName[];
  actions: VetoAction[];
  picks: PickedMap[];
  pendingSide: { map: MapName; chooser: Team } | null;
  log: string[];
}

/* ---------- Saved match history ---------- */

export interface MatchMap {
  order: number;
  name: MapName;
  kind: 'pick' | 'decider';
  by: Team | null;
  side: Side;
  sideBy: Team;
  scoreA: number | null;
  scoreB: number | null;
  played: boolean;
}

export interface MatchRecord {
  id: string;
  createdAt: number;
  bo: Format;
  teamA: string;
  teamB: string;
  firstBan: Team;
  bans: { team: Team; map: MapName }[];
  maps: MatchMap[];
}
