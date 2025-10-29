// API DTO types for backend-proxied inventory and stays
export type ApiAreaCode = 'LL'|'TK'|'RR'|'DD'|'KK'|'CC'|'ER'|'GR'|'TC';

export interface ApiRun {
  code: string;
  areaCode: ApiAreaCode;
  capacity: number;
  subSlots?: ('top'|'bottom')[];
  linkedCodes?: string[];
  notes?: string;
}

export type ApiStayStatus = 'expected'|'checked_in'|'checked_out';
export type ApiAddOn = 'groom'|'enrichment'|'training'|'meds'|'bath'|'nails';

export interface ApiStay {
  id: string;
  petId?: string;
  petName: string;
  guardian?: string;
  runCode: string;
  startAt: string; // ISO datetime from server
  endAt: string;   // ISO datetime from server
  status: ApiStayStatus;
  addOns: ApiAddOn[];
  arrivalToday?: boolean;
  departureToday?: boolean;
  notes?: string;
}

export interface ApiInventorySnapshot {
  runs: ApiRun[];
  stays: ApiStay[];
}

