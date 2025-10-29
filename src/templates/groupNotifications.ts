import { GROUP_LABELS, type GroupType } from '../shared/constants/groups';

interface GroupMovementDetails {
  petName: string;
  groupType: GroupType;
  caregiverName?: string;
  action?: 'moved' | 'checked_in' | 'checked_out';
  timestamp?: Date;
}

const formatTimestamp = (timestamp?: Date) =>
  timestamp ? timestamp.toLocaleString() : 'just now';

const resolveGroupLabel = (groupType: GroupType) => GROUP_LABELS[groupType];

export const buildGroupMovementSms = ({
  petName,
  groupType,
  caregiverName,
  action = 'moved',
  timestamp,
}: GroupMovementDetails) => {
  const label = resolveGroupLabel(groupType);
  const who = caregiverName ? ` with ${caregiverName}` : '';
  const verb =
    action === 'checked_in'
      ? 'checked into'
      : action === 'checked_out'
      ? 'checked out of'
      : 'moved to';

  return `${petName} ${verb} ${label}${who}. ${formatTimestamp(
    timestamp,
  )}`;
};

export const buildGroupMovementEmail = ({
  petName,
  groupType,
  caregiverName,
  action = 'moved',
  timestamp,
}: GroupMovementDetails) => {
  const label = resolveGroupLabel(groupType);
  const who = caregiverName ? ` with ${caregiverName}` : '';
  const verb =
    action === 'checked_in'
      ? 'checked into'
      : action === 'checked_out'
      ? 'checked out of'
      : 'moved to';

  return `Hi there,

${petName} just ${verb} ${label}${who}.

Time: ${formatTimestamp(timestamp)}

Thanks for trusting PawHootz Pet Resort!`;
};
