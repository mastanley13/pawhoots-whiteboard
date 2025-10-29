export interface SeedGroup {
  group_name: string;
  group_type: 'small' | 'medium' | 'large' | 'buddy_play' | 'play_school';
  capacity?: number;
  is_active?: boolean;
}

const seedGroups: SeedGroup[] = [
  { group_name: 'Small Group', group_type: 'small', capacity: 12, is_active: true },
  { group_name: 'Medium Group', group_type: 'medium', capacity: 12, is_active: true },
  { group_name: 'Large Group', group_type: 'large', capacity: 12, is_active: true },
  { group_name: 'Buddy Play', group_type: 'buddy_play', capacity: 8, is_active: true },
  { group_name: 'Play School', group_type: 'play_school', capacity: 8, is_active: true },
];

export default seedGroups;
