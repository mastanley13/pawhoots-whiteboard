-- PawHootz Whiteboard schema migration: yards -> groups
-- Option A: rename the existing table in place
ALTER TABLE yards RENAME TO groups;
ALTER TABLE groups RENAME COLUMN yard_id   TO group_id;
ALTER TABLE groups RENAME COLUMN yard_name TO group_name;
ALTER TABLE groups RENAME COLUMN yard_type TO group_type;

-- Option B: create a brand-new table and copy data across (safer for production)
-- The application keeps a temporary compatibility layer for /api/yards until cleanup.
/*
CREATE TABLE groups (
  group_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  group_type text NOT NULL CHECK (group_type IN ('small','medium','large','buddy_play','play_school')),
  capacity   int,
  occupancy  int,
  is_active  boolean DEFAULT true
);

INSERT INTO groups (group_id, group_name, group_type, capacity, occupancy, is_active)
SELECT
  yard_id,
  CASE
    WHEN yard_name ILIKE '%small%'  THEN 'Small Group'
    WHEN yard_name ILIKE '%medium%' THEN 'Medium Group'
    WHEN yard_name ILIKE '%large%'  THEN 'Large Group'
    WHEN yard_name ILIKE '%play school%' THEN 'Play School'
    ELSE yard_name
  END,
  CASE
    WHEN yard_name ILIKE '%small%'  THEN 'small'
    WHEN yard_name ILIKE '%medium%' THEN 'medium'
    WHEN yard_name ILIKE '%large%'  THEN 'large'
    WHEN yard_name ILIKE '%play school%' THEN 'play_school'
    ELSE 'buddy_play'
  END,
  capacity,
  occupancy,
  is_active
FROM yards;
*/
