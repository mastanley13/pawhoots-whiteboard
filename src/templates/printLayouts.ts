import { GROUP_LABELS, type GroupType } from '../shared/constants/groups';

export interface GroupRosterEntry {
  petName: string;
  groupType: GroupType;
  guardian?: string;
  notes?: string;
}

export const GROUP_ROSTER_COLUMNS = [
  { key: 'petName', label: 'Pet Name' },
  { key: 'groupName', label: 'Group' },
  { key: 'guardian', label: 'Guardian' },
  { key: 'notes', label: 'Notes' },
] as const;

export const buildRosterRow = (entry: GroupRosterEntry) => ({
  petName: entry.petName,
  groupName: GROUP_LABELS[entry.groupType],
  guardian: entry.guardian ?? '—',
  notes: entry.notes ?? '',
});
