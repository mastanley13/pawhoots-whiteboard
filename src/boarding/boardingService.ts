import type { InventorySnapshot } from './types';
import { mockDriver } from './drivers/mockDriver';
import { apiDriver } from './drivers/apiDriver';

export interface BoardingDriver {
  getInventory(date: Date): Promise<InventorySnapshot>;
  moveStay?(stayId: string, targetRun: string, date?: Date): Promise<void>;
  updateNotes?(stayId: string, notes: string, date?: Date): Promise<void>;
  updateStatus?(stayId: string, status: 'expected'|'checked_in'|'checked_out', date?: Date): Promise<void>;
}

export const createDriver = (mode: 'mock' | 'api' = 'mock'): BoardingDriver =>
  mode === 'mock' ? mockDriver() : apiDriver();
