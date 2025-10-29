import type { BoardingDriver } from '../boardingService';
import type { InventorySnapshot, Run, Stay, AddOn } from '../types';
import { INVENTORY_RUNS } from '../data/inventory';

const seedFromDate = (d: Date) => Number(d.toISOString().slice(0, 10).replace(/-/g, ''));
function prng(seed: number) {
  let s = seed | 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const PET_NAMES = ['Luna','Bella','Charlie','Max','Daisy','Cooper','Milo','Lucy','Bailey','Sadie','Rocky','Zoe','Buddy','Tucker','Bear','Molly','Chloe','Stella','Penny','Rosie'];
const GUARDIAN_LAST = ['Smith','Johnson','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee'];

const generateSnapshot = (date: Date, runs: Run[]): InventorySnapshot => {
  const rnd = prng(seedFromDate(date));
  const stays: Stay[] = [];
  for (const run of runs) {
    if (rnd() < 0.6) {
      const startHour = Math.floor(8 + rnd() * 2); // 8–10am
      const endHour = Math.floor(18 + rnd() * 2); // 6–8pm
      const addOnPool: AddOn[] = ['groom', 'enrichment', 'training', 'meds', 'bath', 'nails'];
      const addOns = addOnPool.filter(() => rnd() < 0.15);
      const petName = PET_NAMES[Math.floor(rnd() * PET_NAMES.length)];
      const guardian = `${GUARDIAN_LAST[Math.floor(rnd() * GUARDIAN_LAST.length)]} Family`;
      stays.push({
        id: `${run.code}-${startHour}`,
        petName,
        guardian,
        runCode: run.code,
        startAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour),
        endAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour),
        status: rnd() < 0.8 ? 'checked_in' : 'expected',
        addOns,
        arrivalToday: true,
        departureToday: rnd() < 0.5,
        notes: rnd() < 0.2 ? 'Sensitive stomach' : undefined,
      });
    }
  }
  return { runs, stays };
};

export function mockDriver(): BoardingDriver {
  // In-memory moves for session; keyed by date ISO
  const sessionSnapshots = new Map<string, InventorySnapshot>();

  const getKey = (date: Date) => date.toISOString().slice(0, 10);

  return {
    async getInventory(date: Date) {
      const key = getKey(date);
      if (!sessionSnapshots.has(key)) {
        sessionSnapshots.set(key, generateSnapshot(date, INVENTORY_RUNS));
      }
      return sessionSnapshots.get(key)!;
    },
    async moveStay(stayId: string, targetRun: string, date?: Date) {
      // Minimal validation: ensure run exists
      if (!INVENTORY_RUNS.find((r) => r.code === targetRun)) return;
      const key = getKey(date ?? new Date());
      const snap = sessionSnapshots.get(key);
      if (!snap) return;
      const stay = snap.stays.find((s) => s.id === stayId);
      if (stay) {
        stay.runCode = targetRun;
      }
    },
    async updateNotes(stayId: string, notes: string, date?: Date) {
      const key = getKey(date ?? new Date());
      const snap = sessionSnapshots.get(key);
      if (!snap) return;
      const stay = snap.stays.find((s) => s.id === stayId);
      if (stay) stay.notes = notes;
    },
    async updateStatus(stayId: string, status: 'expected'|'checked_in'|'checked_out', date?: Date) {
      const key = getKey(date ?? new Date());
      const snap = sessionSnapshots.get(key);
      if (!snap) return;
      const stay = snap.stays.find((s) => s.id === stayId);
      if (stay) stay.status = status as any;
    },
  };
}
