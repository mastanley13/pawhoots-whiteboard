import type { Run } from '../types';

// Explicit run code lists by area. Capacities default to 1 except CC (condos).
const LL = Array.from({ length: 18 }, (_, i) => `LL${i + 1}`);
const TK = Array.from({ length: 12 }, (_, i) => `TK${i + 1}`);
const RR = Array.from({ length: 14 }, (_, i) => `RR${i + 1}`);
const DD = Array.from({ length: 18 }, (_, i) => `DD${i + 1}`);
const KK = Array.from({ length: 5 }, (_, i) => `KK${i + 1}`);
const CC = Array.from({ length: 18 }, (_, i) => `CC${i + 1}`);
const ER = Array.from({ length: 6 }, (_, i) => `ER${i + 1}`);
const GR = Array.from({ length: 12 }, (_, i) => `GR${i + 1}`);
const TC = Array.from({ length: 10 }, (_, i) => `TC${i + 1}`);

const asRuns = (codes: string[], capacity = 1): Run[] =>
  codes.map((code) => ({ code, areaCode: code.slice(0, 2) as any, capacity }));

// Build the full static inventory for MVP
export const INVENTORY_RUNS: Run[] = [
  ...asRuns(LL, 1),
  ...asRuns(TK, 1),
  ...asRuns(RR, 1),
  ...asRuns(DD, 1),
  ...asRuns(KK, 1),
  // CC has top/bottom slots
  ...CC.map<Run>((code) => ({ code, areaCode: 'CC', capacity: 2, subSlots: ['top', 'bottom'] })),
  ...asRuns(ER, 1),
  ...asRuns(GR, 1),
  ...asRuns(TC, 1),
];

export const ODD_DD = DD.filter((c) => parseInt(c.slice(2), 10) % 2 === 1);
export const EVEN_DD = DD.filter((c) => parseInt(c.slice(2), 10) % 2 === 0);

