# PAWHOOTZ_REBRAND_TASKS.md
PawHootz Pet Resort — Whiteboard Rebrand & **“Yards → Groups”** Conversion  
**This file is the single source of truth for the Cursor/Codex agent.**  
Place this file in the repo root and keep it open during the session.

---

## 0) Quick Start: How to use this file in Cursor
1) Save this file at the repo root as **`PAWHOOTZ_REBRAND_TASKS.md`**.  
2) In Cursor Chat, send the **one‑liner**:
   ```text
   Read ./PAWHOOTZ_REBRAND_TASKS.md and follow it exactly from Section 1 onward. Work on main (no feature branch). After each step, show plan, diffs, and wait for commit approval.
   ```
3) When the agent asks for approval, review the diff, then reply **OK** (or request changes).  
4) Continue until Section 12 is complete.

> If you later want to work on a branch instead of `main`, tell the agent:  
> **“Switch to branch mode now and create `feature/pawhootz-rebrand-groups`.”**

---

## 1) Workspace Preparation
- **Work on `main`.** Do **not** create a feature branch unless I explicitly say so.
- Ensure dev scripts work (or report if missing):
  - `npm run dev` (or `pnpm dev` / `yarn dev`)
  - `npm run typecheck` (if TS)
  - `npm test` (if tests exist)
- Show a brief **Plan** of the next 2–3 actions before executing.

**Execution Rules (apply for every step):**
- Use **word‑boundary** safe search/replace for Yard→Group to avoid false hits.
- When renaming files/classes/imports, update all references (imports, routes, tests).
- After each atomic step:
  - run typecheck/tests if available;
  - show **Changed files** + **Key diffs** + **Commands executed**;
  - await my **OK** before committing.
- Keep a temporary `/api/yards` → `/api/groups` compatibility layer until cleanup.

---

## 2) Brand Assets & Tokens

### 2.1 Add/Organize Assets
Create: `public/branding/pawhootz/` (or the monorepo equivalent under `/apps/web/public/...`).  
Add the following (filenames must match):
- `pawhootz-logo-horizontal.svg` (primary lockup)
- `pawhootz-logo-horizontal.png` (1x, 2x)
- `pawhootz-badge-circle.svg` (round fist‑bump paw — use for app icons/favicons)
- App icons:
  - `icon-192.png`, `icon-512.png`, `maskable-512.png`, `favicon-32.png`, `favicon.ico`

Use the **badge circle** for all square icons. Use the **horizontal logo** for headers/login.

### 2.2 Brand Colors (from provided logos)
- **PawHootz Purple** `#372879` (primary: headers/nav)
- **PawHootz Orange** `#F04A24` (secondary: CTAs)
- **PawHootz Blue** `#30A7D8` (accent: badges/focus/links)
- **White** `#FFFFFF`

#### CSS Variables
```css
:root{
  --phz-purple:#372879;
  --phz-orange:#F04A24;
  --phz-blue:#30A7D8;
  --phz-white:#FFFFFF;
}
```

#### Tailwind (if used)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#372879',
          secondary: '#F04A24',
          accent: '#30A7D8',
          white: '#FFFFFF'
        }
      }
    }
  }
}
```

---

## 3) App Identity & PWA
- App name everywhere: **PawHootz Pet Resort Whiteboard**
- Replace **all** “Champs” mentions in HTML/manifest/login/footer/metadata.
- Update `public/manifest.json` (or equivalent):
  ```json
  {
    "name": "PawHootz Pet Resort Whiteboard",
    "short_name": "PawHootz",
    "theme_color": "#372879",
    "background_color": "#FFFFFF",
    "icons": [
      { "src": "/branding/pawhootz/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/branding/pawhootz/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "/branding/pawhootz/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose":"maskable" }
    ]
  }
  ```
- Set `<meta name="theme-color" content="#372879">` where applicable.

---

## 4) Terminology & Routes — “Yards” → “Groups”

### 4.1 Copy Map (global)
| Old (Champs) | New (PawHootz) |
|---|---|
| Yard | Group |
| Yards | Groups |
| Yard Board | Group Board |
| Assign to Yard | Assign to Group |
| Move Yards | Move Groups |
| Yard Status | Group Status |
| Small/Medium/Large **Yard** | Small/Medium/Large **Group** |
| Daycare | Play School |
| Private/Buddy Time | Buddy Play |

**Program types supported:**
`small`, `medium`, `large`, `buddy_play`, `play_school`

### 4.2 Slugs/Params
- `/yards` → `/groups`
- `/yards/:id` → `/groups/:id`
- `?yardId=` → `?groupId=`

### 4.3 Component/Service Renames
- `YardBoard` → `GroupBoard`
- `YardCard` → `GroupCard`
- `YardColumn` → `GroupColumn`
- Hooks/Services: `useYards` → `useGroups`, `YardsService` → `GroupsService`
- Types: `Yard`, `YardId`, `YardType` → `Group`, `GroupId`, `GroupType`

> Update imports/exports/tests accordingly. Show diffs before commit.

---

## 5) Safe Codebase‑Wide Replacements

**Discovery (report counts first):**
```bash
rg -n --hidden --glob '!node_modules' -F 'Yard'
rg -n --hidden --glob '!node_modules' -F 'yard'
rg -n --hidden --glob '!node_modules' -F 'Champs'
```

**Targeted replacements (respect word boundaries):**
```bash
# PascalCase components/types
perl -pi -e 's/\\bYards\\b/Groups/g; s/\\bYard\\b/Group/g' $(rg -l '\\bYard(s)?\\b')

# lower-case strings/identifiers
perl -pi -e 's/\\byards\\b/groups/g; s/\\byard\\b/group/g' $(rg -l '\\byard(s)?\\b')

# brand name
perl -pi -e 's/\\bChamps\\b/PawHootz Pet Resort/g' $(rg -l 'Champs')
```

> After replacements, run typecheck/tests and fix any edge cases found in diffs.

---

## 6) Data Model & API

### 6.1 Enums/Constants
```ts
// src/shared/constants/groups.ts
export const GROUP_TYPES = ['small','medium','large','buddy_play','play_school'] as const;
export type GroupType = typeof GROUP_TYPES[number];
export const GROUP_LABELS: Record<GroupType,string> = {
  small: 'Small Group',
  medium: 'Medium Group',
  large: 'Large Group',
  buddy_play: 'Buddy Play',
  play_school: 'Play School',
};
```

### 6.2 Schema Migration (choose best fit; show SQL/Prisma diff)

**A) Rename in place**
```sql
ALTER TABLE yards RENAME TO groups;
ALTER TABLE groups RENAME COLUMN yard_id   TO group_id;
ALTER TABLE groups RENAME COLUMN yard_name TO group_name;
-- If enum exists for yard_type, rename to group_type or migrate values.
```

**B) New table + copy (safer)**
```sql
CREATE TABLE groups (
  group_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  group_type text NOT NULL CHECK (group_type IN ('small','medium','large','buddy_play','play_school')),
  capacity   int,
  is_active  boolean DEFAULT true
);

INSERT INTO groups (group_name, group_type, capacity, is_active)
SELECT
  CASE
    WHEN y.yard_name ILIKE '%small%'  THEN 'Small Group'
    WHEN y.yard_name ILIKE '%medium%' THEN 'Medium Group'
    WHEN y.yard_name ILIKE '%large%'  THEN 'Large Group'
    ELSE y.yard_name
  END,
  CASE
    WHEN y.yard_name ILIKE '%small%'  THEN 'small'
    WHEN y.yard_name ILIKE '%medium%' THEN 'medium'
    WHEN y.yard_name ILIKE '%large%'  THEN 'large'
    ELSE 'buddy_play'
  END,
  y.capacity,
  y.is_active
FROM yards y;
```

### 6.3 API Contracts
- `GET /api/groups` → returns `group_id`, `group_name`, `group_type`, `capacity`, `occupancy`
- `PATCH /api/groups/:id`
- Temporary compatibility (remove in Section 11):
  - `/api/yards` → 301 to `/api/groups`
  - Response adapter maps `yard_*` → `group_*`

---

## 7) Whiteboard UI Changes
- Columns (sortable): **Small**, **Medium**, **Large**, **Buddy Play**, **Play School**
- Filters: by `group_type` and by status (Checked‑In, Checked‑Out, In‑Group, In‑Kennel)
- Dialogs/buttons:
  - “Add Group”, “Assign to Group”, “Move to Group”, “View Group”
  - “Create Play School Session”
- Theming:
  - Header/nav background → **#372879**
  - Primary buttons → **#F04A24**
  - Info/active badges + focus ring → **#30A7D8**

---

## 8) Login / Header / Footer
- Swap navbar/login logo → `branding/pawhootz/pawhootz-logo-horizontal.svg`
- Update footer text to **PawHootz Pet Resort**
- Use badge circle asset for favicons and app tiles.

---

## 9) Notifications / Prints - Completed
- Update SMS/Email templates: "yard" -> "group"
  Example: *Bella moved to **Large Group***
  (Implemented in `src/templates/groupNotifications.ts`)
- Printed rosters/kennel cards: headings **Group** / **Group Type**
  (Implemented in `src/templates/printLayouts.ts`)

---
## 10) Seeds (if applicable)
```ts
// scripts/seed-groups.ts (or seeding mechanism used by the project)
export default [
  { group_name: 'Small Group',  group_type: 'small' },
  { group_name: 'Medium Group', group_type: 'medium' },
  { group_name: 'Large Group',  group_type: 'large' },
  { group_name: 'Buddy Play',   group_type: 'buddy_play' },
  { group_name: 'Play School',  group_type: 'play_school' },
];
```

---

## 11) Tests & QA
- Update unit tests to new `group_*` fields and route names.
- E2E checklist:
  1. Create pets and assign to **Small/Medium/Large** → visible in correct columns.
  2. Create **Buddy Play** session → board reflects counts; filter works.
  3. Create **Play School** session → board reflects counts; filter works.
  4. Drag‑and‑drop across groups persists to DB.
- Accessibility: AA contrast; visible focus states using brand accent blue.
**Status (2025-10-28):** Manual QA pass completed in browser; live data confirmed for group placement, Buddy Play/Play School sessions, and drag/drop persistence. Accessibility spot-check via keyboard navigation passes.

---

## 12) Commit & Cleanup Plan (working on `main`)
Create **small, reviewable commits** and await approval after each:

1. **feat(brand):** add PawHootz assets + color tokens  
2. **feat(brand):** manifest/title/login/header + favicons  
3. **refactor(groups):** Yard→Group (types/components/routes) + safe replaces  
4. **feat(groups):** API + seeds + filters + board columns  
5. **chore:** tests/fixtures updates  
6. **cleanup:** remove `/api/yards` alias + dead code

**Final Acceptance:**
- No “Champs” or “Yard(s)” left anywhere (UI/API/notifications/prints).
- Board shows **Small / Medium / Large / Buddy Play / Play School**.
- Brand colors & logos applied.
- Build runs; typecheck/tests pass.

---

### Appendix A — Temporary Adapter (optional; remove in Step 6/Commit 6)
```ts
// adapters/yardToGroup.ts
export function adaptYardRecord(y: any) {
  return {
    group_id: y.yard_id,
    group_name: y.yard_name.replace(/Yard/i, 'Group'),
    group_type: mapNameToType(y.yard_name),
  };
}
function mapNameToType(name: string) {
  const n = name.toLowerCase();
  if (n.includes('small')) return 'small';
  if (n.includes('medium')) return 'medium';
  if (n.includes('large')) return 'large';
  if (n.includes('play school')) return 'play_school';
  return 'buddy_play';
}
```


