export type AreaCode = 'LL'|'TK'|'RR'|'DD'|'KK'|'CC'|'ER'|'GR'|'TC';

export interface Run {
  code: string;
  areaCode: AreaCode;
  capacity: number;
  subSlots?: ('top'|'bottom')[];
  linkedCodes?: string[];
  notes?: string;
}

export type StayStatus = 'expected'|'checked_in'|'checked_out';
export type AddOn = 'groom'|'enrichment'|'training'|'meds'|'bath'|'nails';

export interface Stay {
  id: string;
  petId?: string;
  petName: string;
  guardian?: string;
  runCode: string;
  startAt: Date;
  endAt: Date;
  status: StayStatus;
  addOns: AddOn[];
  arrivalToday?: boolean;
  departureToday?: boolean;
  notes?: string;
}

export interface InventorySnapshot {
  runs: Run[];
  stays: Stay[];
}

