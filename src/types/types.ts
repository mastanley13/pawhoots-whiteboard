// Location history entry interface
export interface LocationHistoryEntry {
  area: 'yard1' | 'yard2' | 'lobby' | 'smallDogSuite' | 'training' | 'available' | 'runs' | 'chucksAlley' | 'nalasDen' | 'trinsTown' | null;
  position: number | null;
  timestamp: Date;
}

// Scheduled move interface
export interface ScheduledMove {
  id: string;
  targetArea: 'yard1' | 'yard2' | 'lobby' | 'smallDogSuite' | 'training' | 'available' | 'runs' | 'chucksAlley' | 'nalasDen' | 'trinsTown' | null;
  targetPosition: number | null;
  scheduledTime: Date;
  completed: boolean;
}

// Dog interface
export interface Dog {
  id: string;
  name: string;
  breed: string;
  location: {
    area: 'yard1' | 'yard2' | 'lobby' | 'smallDogSuite' | 'training' | 'available' | 'runs' | 'chucksAlley' | 'nalasDen' | 'trinsTown' | null;
    position: number | null;
  };
  color: 'green' | 'yellow' | 'orange' | 'blue' | 'red' | null; // For different status indicators
  traits: string[];
  lastUpdated: Date; // Field to track when dog's location was last updated
  assignedStaff: string | null; // New field for staff assignment
  locationHistory: LocationHistoryEntry[]; // New field to track location history
  scheduledMoves: ScheduledMove[]; // New field for scheduled moves
  // Adding more fields for contact info
  owner?: string;
  ownerPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  veterinarian?: string;
  vetPhone?: string;
  medications?: string[];
  feedingSchedule?: string;
  notes?: string;
}

// Staff interface
export interface Staff {
  id: string;
  name: string;
  position: string;
  avatar?: string;
}

// Type for location areas
export type LocationArea = Dog['location']['area']; 