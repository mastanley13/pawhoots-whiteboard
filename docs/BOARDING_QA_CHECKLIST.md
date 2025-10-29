# Boarding Whiteboard — QA Checklist (P0/P1)

Use this to verify the mock-driven board before backend integration.

## Functional
- Loads `/boarding` with mock data when `VITE_FEATURE_BOARDING=1`.
- Area occupancy chips show occupied/total capacity.
- Filters:
  - Area: filters sections correctly.
  - Vacant only: hides fully occupied runs.
  - Persist changes: when enabled, reload retains moves for the selected date.
- Date controls: ◀ Today ▶ navigate days within ±7; data changes deterministically.
- Drag and drop:
  - Mouse: moving to a run with capacity succeeds.
  - Mouse: moving to a full run does nothing (snapback).
  - Keyboard: focus a card, press `m` or Shift+Enter to pick up; focus a run and press Enter/Space to drop.
- Modal: click a pet card to open details; Esc/outside click closes.

## Accessibility
- Focus rings are visible on interactive elements.
- Live region announces: pickup, full destination, successful move.
- Pet cards and runs are reachable by keyboard; tab order is logical.

## Visual/Brand
- Pet name is bold in brand purple; time is subtle monospace.
- Pet card (white) contrasts with holder (light gray).
- Area chips use brand accent; overall contrast meets AA.

## Print
- Header/footer/nav and filters/legend are hidden.
- Sections avoid breaking across pages; density looks appropriate.

## Perf/Resilience
- No console errors during typical interactions.
- Board remains responsive with all areas visible.

---

Sign-off:
- [ ] Functional
- [ ] Accessibility
- [ ] Visual/Brand
- [ ] Print
- [ ] Performance
