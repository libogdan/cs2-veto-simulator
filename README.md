# CS2 Map Veto Simulator

React 19 + TypeScript + Tailwind CSS v4 (Vite). BO1 / BO3 / BO5 map veto against a random opponent,
side selection, per-map scores, and a localStorage match history.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
```

## Structure

```
public/maps/            map screenshots (dust2.jpg, mirage.jpg, ...)
src/
  types.ts              shared types
  lib/
    maps.ts             the 7-map pool + image paths  <- edit to change the pool
    veto.ts             PURE veto logic (sequence, ban/pick, side rule, decider, record)
    series.ts           map winner / series score / wins needed
  hooks/
    useVeto.ts          reducer + effect that plays the opponent (timers are cancelled on reset)
    useHistory.ts       localStorage history (add / update / remove / clear)
  components/
    SetupPanel.tsx      names, format, who bans first
    VetoPanel.tsx       status, side choice buttons, log
    MapGrid.tsx         map cards
    ResultsPanel.tsx    series score, per-map scores, "mark as not played"
    HistoryDrawer.tsx   slide-over history list (open / edit scores / delete / clear all)
  App.tsx               wires everything together
```

## Rules implemented

| Format | Order | Left over |
|---|---|---|
| BO1 | ban x6 (alternating) | the map played |
| BO3 | ban, ban, pick, pick, ban, ban | decider |
| BO5 | ban, ban, pick, pick, pick, pick | decider |

- The team that does **not** pick a map chooses its starting side (CT/T).
- The decider's side is a coinflip.
- Opponent bans / picks / side choices are random.

## Using it in Next.js (App Router)

1. Copy `src/`, and `public/maps/` into your project (adjust the `@/` or relative imports if you use an alias).
2. `App.tsx` already starts with `'use client'`, so render it from any page:
   ```tsx
   // app/veto/page.tsx
   import App from '@/components/veto/App';
   export default function Page() { return <App />; }
   ```
3. Tailwind v4 needs `@import "tailwindcss";` in your global CSS (already the case in a fresh v4 setup).
   On **Tailwind v3**, a few classes need swapping: `size-*` -> `w-* h-*`, `max-w-18` -> `max-w-[4.5rem]`,
   `bg-linear-*` is not used (only `bg-gradient-to-*`, which works in both).
4. History is read from localStorage inside an effect, so there is no hydration mismatch.

## Notes

- Images are `<img>` tags (not `next/image`) to stay framework-agnostic.
- History key: `cs2veto.history.v1`.
- Map images in `public/maps` are your uploaded screenshots, resized to 480x220.
