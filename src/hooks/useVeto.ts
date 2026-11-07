import { useCallback, useEffect, useReducer } from 'react';
import type { MapName } from '../lib/maps';
import {
  applyAct,
  applyDecider,
  applySide,
  createVeto,
  currentStep,
  needsDecider,
} from '../lib/veto';
import type { Side, Team, VetoConfig, VetoState } from '../types';

type Msg =
  | { type: 'start'; state: VetoState }
  | { type: 'reset' }
  | { type: 'act'; map: MapName }
  | { type: 'side'; side: Side }
  | { type: 'decider'; side: Side; chooser: Team };

function reducer(state: VetoState | null, msg: Msg): VetoState | null {
  switch (msg.type) {
    case 'start':
      return msg.state;
    case 'reset':
      return null;
    case 'act':
      return state && applyAct(state, msg.map);
    case 'side':
      return state && applySide(state, msg.side);
    case 'decider':
      return state && applyDecider(state, msg.side, msg.chooser);
  }
}

const randomSide = (): Side => (Math.random() < 0.5 ? 'CT' : 'T');
const randomTeam = (): Team => (Math.random() < 0.5 ? 'A' : 'B');

/**
 * Owns the veto state machine. The opponent (team B) is driven by an effect:
 * every state change schedules at most one timer, and the cleanup cancels it,
 * so resetting or restarting mid-veto can never trigger a stale move.
 */
export function useVeto() {
  const [state, dispatch] = useReducer(reducer, null);

  useEffect(() => {
    if (!state) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const step = currentStep(state);

    if (state.pendingSide) {
      // Opponent chooses a side after you picked a map.
      if (state.pendingSide.chooser === 'B') {
        timer = setTimeout(() => dispatch({ type: 'side', side: randomSide() }), 500);
      }
    } else if (step) {
      // Opponent bans / picks a random remaining map.
      if (step.team === 'B') {
        timer = setTimeout(() => {
          const map = state.remaining[Math.floor(Math.random() * state.remaining.length)];
          dispatch({ type: 'act', map });
        }, 650);
      }
    } else if (needsDecider(state)) {
      dispatch({ type: 'decider', side: randomSide(), chooser: randomTeam() });
    }

    return () => clearTimeout(timer);
  }, [state]);

  const start = useCallback(
    (cfg: VetoConfig) => dispatch({ type: 'start', state: createVeto(cfg) }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const pickMap = useCallback((map: MapName) => dispatch({ type: 'act', map }), []);
  const chooseSide = useCallback((side: Side) => dispatch({ type: 'side', side }), []);

  return { state, start, reset, pickMap, chooseSide };
}
