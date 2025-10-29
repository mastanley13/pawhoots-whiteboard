# Boarding Whiteboard — Spec (MVP)

Status: Draft  
Owner: @pawhootz  
Route: `/boarding` (feature‑flagged)

---

## Goals
- Branded, fast Boarding Whiteboard for daily ops.
- Drag‑and‑drop moves; keyboard accessible.
- Today view: vacancies, arrivals, departures, add‑ons, notes.
- No external integrations for MVP; use deterministic mock data.

## Non‑Goals (MVP)
- Vendor integrations; payments/billing; advanced reporting.

---

## IA & Inventory
- Areas (sections): LL, TK, RR, DD, KK, CC, ER, GR, TC.
- Support: capacity (1/2), top/bottom condos, linked double‑wide runs via `linkedCodes`.

### Finalized Inventory (MVP)
- Labrador Lounge (LL): LL1–LL18, capacity 1 each
- Texas Tails (TK): TK1–TK12, capacity 1 each
- Rover Runs (RR): RR1–RR14, capacity 1 each
- Doggie Digs (DD): DD1–DD18, capacity 1 each
  - Layout hint: display in ODD (DD1,3,..,17) and EVEN (DD2,4,..,18) visual groups
- K9 Kottages (KK): KK1–KK5, capacity 1 each
- Cat Condos (CC): CC1–CC18, capacity 2 each with subSlots ['top','bottom']
- Enrichment Runs (ER): ER1–ER6, capacity 1 each
- Groom Room (GR): GR1–GR12, capacity 1 each
- Training Center (TC): TC1–TC10, capacity 1 each

Linked/double‑wide: none required for MVP (can be added per run with `linkedCodes` later).

---

## Domain Model (TS)
```ts
export type AreaCode = 'LL'|'TK'|'RR'|'DD'|'KK'|'CC'|'ER'|'GR'|'TC';
export interface Run { code: string; areaCode: AreaCode; capacity: number; subSlots?: ('top'|'bottom')[]; linkedCodes?: string[]; notes?: string; }
export type StayStatus = 'expected'|'checked_in'|'checked_out';
export type AddOn = 'groom'|'enrichment'|'training'|'meds'|'bath'|'nails';
export interface Stay { id: string; petName: string; guardian?: string; runCode: string; startAt: Date; endAt: Date; status: StayStatus; addOns: AddOn[]; arrivalToday?: boolean; departureToday?: boolean; notes?: string; }
export interface InventorySnapshot { runs: Run[]; stays: Stay[]; }
```

---

## UX Overview
- Summary Bar: date (Today), totals (occupied/available), arrivals, departures.
- Filters: area, status, add‑ons, search, "Vacant only".
- Area Panels: collapsible; occupancy chip.
- Run Grid: fixed cells; vacancy clearly indicated.
- PetCard: name, guardian, in/out times, add‑on badges; open details modal.
- Legend: add‑on and status colors.

Interactions
- Drag‑and‑drop with capacity/linked validation + snapback.
- Keyboard: Tab/Enter to move; Esc cancel; SR announcements.
- Optional localStorage to persist demo state.

Legend & Badges
- Arrivals today: green dot; Departures today: purple notch on right edge.
- Add‑ons: groom ✂, enrichment ⭐, training 🎓, meds 💊, bath 🛁, nails 🐾.

---

## Brand & A11y
- Colors: purple `#372879`, orange `#F04A24`, blue `#30A7D8`, white.
- High contrast; brand blue focus rings.
- ARIA roles for DnD; managed focus in modal.

---

## Components
- BoardingBoard (page state & driver)
- SummaryBar, BoardingFilters, Legend
- AreaPanel → RunGrid → RunCell → PetCard
- PetDetailsModal

Key Props
- BoardingBoard: `driver`, `date`, `onDateChange`.
- AreaPanel: `area`, `runs`, `stays`, `onMove`, `collapsed`.
- RunCell: `run`, `staysInRun`, `onDrop`.

---

## Data Drivers
- `mockDriver` (MVP): deterministic generator by date; in‑memory moves; optional localStorage.
- `apiDriver` (future): backend proxy; same shapes (`Run`, `Stay`).

Factory
```ts
export interface BoardingDriver { getInventory(date: Date): Promise<InventorySnapshot>; moveStay?(stayId: string, targetRun: string): Promise<void>; }
export const createDriver = (mode: 'mock'|'api'='mock'): BoardingDriver => mode==='mock'?mockDriver():apiDriver();
```

API driver endpoints (expected)
- `GET /api/boarding/inventory?date=YYYY-MM-DD` → `{ runs: ApiRun[], stays: ApiStay[] }`
- `POST /api/boarding/move` → `{ stayId, targetRun }` status 200 on success
Environment
- `VITE_BOARDING_API_BASE` optional to override `/api/boarding` base path
Client normalization
- Convert `startAt`/`endAt` from ISO strings to `Date`

Mock generation sketch
```ts
// Deterministic seed by YYYYMMDD
const seedFromDate = (d: Date) => Number(d.toISOString().slice(0,10).replace(/-/g,''));
function prng(seed: number){ let s = seed|0; return () => (s = (s*1664525+1013904223)>>>0) / 2**32; }

export function generateSnapshot(date: Date, runs: Run[]): InventorySnapshot {
  const rnd = prng(seedFromDate(date));
  const stays: Stay[] = [];
  for (const run of runs){
    // ~60% occupied baseline
    if (rnd() < 0.6){
      const startHour = Math.floor(8 + rnd()*2); // 8–10am
      const endHour = Math.floor(18 + rnd()*2);  // 6–8pm
      const addOnPool: AddOn[] = ['groom','enrichment','training','meds','bath','nails'];
      const addOns = addOnPool.filter(()=> rnd()<0.15);
      stays.push({
        id: `${run.code}-${startHour}`,
        petName: `Pet ${Math.floor(rnd()*900)+100}`,
        guardian: `Guardian ${Math.floor(rnd()*90)+10}`,
        runCode: run.code,
        startAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour),
        endAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour),
        status: rnd() < 0.8 ? 'checked_in' : 'expected',
        addOns,
        arrivalToday: true,
        departureToday: rnd() < 0.5,
        notes: rnd()<0.2 ? 'Sensitive stomach' : undefined,
      });
    }
  }
  return { runs, stays };
}
```

---

## Routing & Flags
- Add `/boarding` behind `VITE_FEATURE_BOARDING=1`.
- `VITE_BOARDING_DRIVER=mock|api` (default `mock`).
 - Production default: feature flag OFF until QA sign‑off.

---

## Milestones
- P0 Read‑only: route + flag, static inventory, generated stays, filters, legend, print view.
- P1 Interactive: drag‑drop, check‑in/out (mock), modal, optional persistence.
- P2 Date switching ±7 days; polish + accessibility pass.

Acceptance (P0)
- Renders all areas/runs; counts correct.
- Filters fast and predictable.

---

## Risks
- Varying capacity/linked rules → declarative inventory config.
- Performance on large boards → consider virtualization >600 cells.
- Token drift → align Tailwind tokens before final polish.

---

## Open Questions
1) Confirm exact inventory and linked/double‑wide rules.
2) Condos: explicit top/bottom vs. capacity 2?
3) Day‑one add‑on set and icons?
4) Feature flag default on production?

## Commit Plan (when building)
1. docs: add spec
2. feat(boarding): scaffold route + feature flag
3. feat(boarding): mock inventory + driver + read‑only UI
4. feat(boarding): drag‑drop + modal + persistence
5. chore: print views + QA + a11y
