export const GROUP_TYPES = ['small', 'medium', 'large', 'buddy_play', 'play_school'] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

export const GROUP_LABELS: Record<GroupType, string> = {
  small: 'Small Group',
  medium: 'Medium Group',
  large: 'Large Group',
  buddy_play: 'Buddy Play',
  play_school: 'Play School',
};
