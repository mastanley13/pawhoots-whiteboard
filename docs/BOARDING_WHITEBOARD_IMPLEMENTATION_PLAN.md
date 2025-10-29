# Boarding Whiteboard — Implementation Plan (Docs Only)

This complements docs/BOARDING_WHITEBOARD_SPEC.md with explicit inventory lists, file plan, and immediate tasks. No code yet.

---

## Inventory Code Lists (explicit)
- LL: LL1, LL2, LL3, LL4, LL5, LL6, LL7, LL8, LL9, LL10, LL11, LL12, LL13, LL14, LL15, LL16, LL17, LL18
- TK: TK1, TK2, TK3, TK4, TK5, TK6, TK7, TK8, TK9, TK10, TK11, TK12
- RR: RR1, RR2, RR3, RR4, RR5, RR6, RR7, RR8, RR9, RR10, RR11, RR12, RR13, RR14
- DD ODD: DD1, DD3, DD5, DD7, DD9, DD11, DD13, DD15, DD17
- DD EVEN: DD2, DD4, DD6, DD8, DD10, DD12, DD14, DD16, DD18
- KK: KK1, KK2, KK3, KK4, KK5
- CC: CC1..CC18 (each with subSlots top/bottom)
- ER: ER1..ER6
- GR: GR1..GR12
- TC: TC1..TC10

Capacities
- Default capacity 1 for LL/TK/RR/DD/KK/ER/GR/TC.
- CC uses capacity 2 with subSlots ['top','bottom'].

---

## File & Component Plan

Folder layout (to be scaffolded later, behind feature flag)
```
src/boarding/
  BoardingBoard.tsx           // page container
  components/
    SummaryBar.tsx
    BoardingFilters.tsx
    AreaPanel.tsx
    RunGrid.tsx
    RunCell.tsx
    PetCard.tsx
    Legend.tsx
    PetDetailsModal.tsx
  data/
    inventory.ts              // finalized inventory map
  drivers/
    mockDriver.ts             // deterministic mock generator + in-memory moves
    apiDriver.ts              // placeholder for future proxy integration
  boardingService.ts          // driver factory + types re-exports
  types.ts                    // Run, Stay, InventorySnapshot, enums
  utils.ts                    // helpers: filters, grouping, PRNG, dnd guards
```

Routing & flags
- Add `/boarding` route gated by `VITE_FEATURE_BOARDING`.
- Driver selection via `VITE_BOARDING_DRIVER` (default `mock`).

---

## Immediate Tasks (when implementing)
1) Scaffold folders/files above with empty components and types.
2) Implement `data/inventory.ts` from the explicit lists and capacities.
3) Implement `drivers/mockDriver.ts` using the generation sketch in the spec; wire into `boardingService`.
4) Build read-only UI: SummaryBar, Filters (static), AreaPanel with RunGrid/RunCell.
5) Add Legend and badges; apply brand tokens.
6) Add PetDetailsModal (static content) and print-friendly styles.
7) Implement drag-and-drop with capacity validation and snapback.
8) Optional localStorage persistence; run a11y and QA checklist.

Acceptance gates
- P0: Accurate rendering from mock snapshot; responsive layout; filters display.
- P1: DnD works with validation; keyboard and SR announcements in place.

---

## Notes
- Keep inventory declarative to reflect future rule changes (linked/double-wide, blocked runs, etc.).
- Consider virtualization if DOM cell count grows beyond ~600.

---

## Status (running log)
- P0 complete: read-only board, filters, legend, print styles, brand polish.
- P1 complete: drag-and-drop (mouse + keyboard), details modal, optional persistence, a11y pass.

Next up
- Plan backend proxy integration for API driver: finalize `/api/boarding/inventory` and `/api/boarding/move` contracts and wire `VITE_BOARDING_DRIVER=api` behind a feature flag for QA.
