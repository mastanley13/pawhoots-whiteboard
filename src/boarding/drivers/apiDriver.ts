import axios from 'axios';
import type { BoardingDriver } from '../boardingService';
import type { InventorySnapshot, Stay } from '../types';
import type { ApiInventorySnapshot } from '../api/types';

const API_BASE = (import.meta as any).env?.VITE_BOARDING_API_BASE || '/api/boarding';

function normalize(snapshot: ApiInventorySnapshot): InventorySnapshot {
  return {
    runs: snapshot.runs.map((r) => ({
      code: r.code,
      areaCode: r.areaCode as any,
      capacity: r.capacity,
      subSlots: r.subSlots,
      linkedCodes: r.linkedCodes,
      notes: r.notes,
    })),
    stays: snapshot.stays.map<Stay>((s) => ({
      id: s.id,
      petId: s.petId,
      petName: s.petName,
      guardian: s.guardian,
      runCode: s.runCode,
      startAt: new Date(s.startAt),
      endAt: new Date(s.endAt),
      status: s.status,
      addOns: s.addOns as any,
      arrivalToday: s.arrivalToday,
      departureToday: s.departureToday,
      notes: s.notes,
    })),
  };
}

export function apiDriver(): BoardingDriver {
  return {
    async getInventory(date: Date) {
      const dateStr = date.toISOString().slice(0, 10);
      const { data } = await axios.get<ApiInventorySnapshot>(`${API_BASE}/inventory`, {
        params: { date: dateStr },
      });
      return normalize(data);
    },
    async moveStay(stayId: string, targetRun: string, date?: Date) {
      const dateStr = (date ?? new Date()).toISOString().slice(0, 10);
      await axios.post(`${API_BASE}/move`, { stayId, targetRun, date: dateStr });
    },
    async updateNotes(stayId: string, notes: string, date?: Date) {
      const dateStr = (date ?? new Date()).toISOString().slice(0, 10);
      await axios.post(`${API_BASE}/note`, { stayId, notes, date: dateStr });
    },
    async updateStatus(stayId: string, status: 'expected'|'checked_in'|'checked_out', date?: Date) {
      const dateStr = (date ?? new Date()).toISOString().slice(0, 10);
      await axios.post(`${API_BASE}/status`, { stayId, status, date: dateStr });
    },
  };
}
