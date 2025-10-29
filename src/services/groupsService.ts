import axios, { AxiosError } from 'axios';
import type { GroupType } from '../shared/constants/groups';

export interface GroupRecord {
  group_id: string;
  group_name: string;
  group_type: GroupType;
  capacity?: number | null;
  occupancy?: number | null;
  is_active?: boolean;
}

interface YardRecord {
  yard_id: string;
  yard_name: string;
  yard_type?: string;
  capacity?: number | null;
  occupancy?: number | null;
  is_active?: boolean;
}

const API_BASE = '/api';
const GROUPS_ENDPOINT = `${API_BASE}/groups`;
const YARDS_ENDPOINT = `${API_BASE}/yards`;

const mapNameToType = (name: string): GroupType => {
  const lower = name.toLowerCase();
  if (lower.includes('small')) return 'small';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('large')) return 'large';
  if (lower.includes('play school')) return 'play_school';
  return 'buddy_play';
};

const adaptYardRecord = (yard: YardRecord): GroupRecord => ({
  group_id: yard.yard_id,
  group_name: yard.yard_name.replace(/Yard/i, 'Group'),
  group_type: mapNameToType(yard.yard_name),
  capacity: yard.capacity ?? null,
  occupancy: yard.occupancy ?? null,
  is_active: yard.is_active ?? true,
});

const normalizeGroupRecord = (record: GroupRecord): GroupRecord => ({
  ...record,
  group_type: record.group_type ?? mapNameToType(record.group_name),
});

export const fetchGroups = async (): Promise<GroupRecord[]> => {
  try {
    const { data } = await axios.get<GroupRecord[]>(GROUPS_ENDPOINT);
    return data.map(normalizeGroupRecord);
  } catch (error) {
    const axiosError = error as AxiosError;

    // Fall back to legacy yards endpoint on 404/301/308 responses
    if (axiosError.response && [301, 302, 303, 307, 308, 404].includes(axiosError.response.status)) {
      const { data } = await axios.get<YardRecord[]>(YARDS_ENDPOINT);
      return data.map(adaptYardRecord);
    }

    throw error;
  }
};

export const fetchGroupById = async (id: string): Promise<GroupRecord> => {
  try {
    const { data } = await axios.get<GroupRecord>(`${GROUPS_ENDPOINT}/${id}`);
    return normalizeGroupRecord(data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response && [301, 302, 303, 307, 308, 404].includes(axiosError.response.status)) {
      const { data } = await axios.get<YardRecord>(`${YARDS_ENDPOINT}/${id}`);
      return adaptYardRecord(data);
    }
    throw error;
  }
};
