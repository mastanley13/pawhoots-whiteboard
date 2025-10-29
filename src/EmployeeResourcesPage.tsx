import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dog, Staff, LocationHistoryEntry, ScheduledMove, LocationArea } from './types/types'; // Removed DogColor import
import { DogDetailsModal } from './components/DogDetailsModal';
import { SearchFilterBar, type GroupStatusFilter, type ColumnSortOption } from './components/SearchFilterBar';
import { SchedulerPanel } from './components/SchedulerPanel';
import { DogPool } from './components/DogPool';
import { AreaSection } from './components/AreaSection';
import {
  searchCustomObjectRecords,
  getCalendarEvents,
  getAssociatedPetIds,
  getPetRecordById,
  mapGhlPetToDog,
  GhlPetRecord
} from './services/api';
import { GHLContactSearch } from './components/GHLContactSearch';
import { normalizeDogRecord, normalizeLocationArea } from './utils';
import { GROUP_LABELS, type GroupType } from './shared/constants/groups';

// Define a type for the GHL Pet record structure (adjust based on actual GHL response)
// REMOVED - Now imported from api.ts
// interface GhlPetRecord { ... }

// Removed areaConfigs as it's likely managed within AreaSection/BoardingRunsSection now

// Type for the keys of areaConfigs (Keep if needed by LocationArea type or other logic)
// Define area configurations including capacity (Moved here if needed, otherwise remove)
const areaConfigs = {
  small: { title: GROUP_LABELS.small, positions: 12 },
  medium: { title: GROUP_LABELS.medium, positions: 12 },
  large: { title: GROUP_LABELS.large, positions: 12 },
  buddy_play: { title: GROUP_LABELS.buddy_play, positions: 8 },
  play_school: { title: GROUP_LABELS.play_school, positions: 8 },
  lobby: { title: 'Lobby', positions: 9 },
  chucksAlley: { title: "Chuck's Alley", positions: 8 },
  trinsTown: { title: "Trin's Town", positions: 8 },
  nalasDen: { title: "Nala's Den", positions: 8 },
  // legacy areas retained but not shown
  smallDogSuite: { title: 'Small Dog Suite', positions: 6 },
  training: { title: 'Training', positions: 4 },
  runs: { title: 'Runs', positions: 8 },
} as const;

const primaryGroupKeys = ['small', 'medium', 'large', 'buddy_play', 'play_school'] as const;
type PrimaryGroupKey = typeof primaryGroupKeys[number];
const BOARDING_RUN_LOCATIONS = new Set<LocationArea | string>(['runs', 'chucksAlley', 'nalasDen', 'trinsTown']);
const PRIMARY_COLUMN_SET = new Set<PrimaryGroupKey>(['small', 'medium', 'large']);
const SECONDARY_COLUMN_SET = new Set<PrimaryGroupKey>(['buddy_play', 'play_school']);

const demoDogs: Dog[] = [
  {
    id: 'demo-small-1',
    name: 'Luna',
    breed: 'Golden Retriever',
    location: { area: 'small', position: 1 },
    color: 'green',
    traits: ['gentle'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: 'small', position: 1, timestamp: new Date() }],
    scheduledMoves: [],
  },
  {
    id: 'demo-medium-1',
    name: 'Moose',
    breed: 'Bernedoodle',
    location: { area: 'medium', position: 1 },
    color: 'blue',
    traits: ['friendly'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: 'medium', position: 1, timestamp: new Date() }],
    scheduledMoves: [],
  },
  {
    id: 'demo-large-1',
    name: 'Koda',
    breed: 'Alaskan Malamute',
    location: { area: 'large', position: 1 },
    color: 'orange',
    traits: ['energetic'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: 'large', position: 1, timestamp: new Date() }],
    scheduledMoves: [],
  },
  {
    id: 'demo-buddy-1',
    name: 'Piper',
    breed: 'Beagle',
    location: { area: 'buddy_play', position: 1 },
    color: 'yellow',
    traits: ['vocal'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: 'buddy_play', position: 1, timestamp: new Date() }],
    scheduledMoves: [],
  },
  {
    id: 'demo-school-1',
    name: 'Harper',
    breed: 'Border Collie',
    location: { area: 'play_school', position: 1 },
    color: 'blue',
    traits: ['jumper'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: 'play_school', position: 1, timestamp: new Date() }],
    scheduledMoves: [],
  },
  {
    id: 'demo-available-1',
    name: 'Scout',
    breed: 'Australian Shepherd',
    location: { area: null, position: null },
    color: 'green',
    traits: ['gentle'],
    lastUpdated: new Date(),
    assignedStaff: null,
    locationHistory: [{ area: null, position: null, timestamp: new Date() }],
    scheduledMoves: [],
  },
];


// type NavSection = 'main' | 'portal' | 'external'; // Defined type for nav section

// --- Helper Hook for Debounce ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

export function EmployeeResourcesPage() {
  // --- State Definitions ---
  // const [activeNavSection, setActiveNavSection] = useState<NavSection | null>(null); // Use NavSection type, default to null
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [traitFilter, setTraitFilter] = useState<string>('');
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null); // Renamed for clarity, holds ID
  const [showImport, setShowImport] = useState<boolean>(false);
  const [dogs, setDogs] = useState<Dog[]>(demoDogs); // Seeded with demo dogs; replaced when live data loads
  const [staff] = useState<Staff[]>([]); // Empty array, no mock staff
  const [groupTypeFilter, setGroupTypeFilter] = useState<GroupType | ''>('');
  const [statusFilter, setStatusFilter] = useState<GroupStatusFilter>('all');
  const [columnSort, setColumnSort] = useState<ColumnSortOption>('default');

  // --- GHL State ---
  const [ghlSearchQuery, setGhlSearchQuery] = useState<string>(''); // Input field value
  const [ghlPets, setGhlPets] = useState<GhlPetRecord[]>([]); // Suggestions from API
  const [selectedGhlPetId, setSelectedGhlPetId] = useState<string | null>(null); // ID of the selected suggestion
  const [isFetchingGhlPets, setIsFetchingGhlPets] = useState<boolean>(false);

  // --- NEW: State for fetching scheduled dogs ---
  const [isLoadingScheduledDogs, setIsLoadingScheduledDogs] = useState<boolean>(false);
  const [fetchScheduledDogsError, setFetchScheduledDogsError] = useState<string | null>(null);

  // --- Debounce Search Query ---
  const debouncedGhlSearchQuery = useDebounce(ghlSearchQuery, 500); // 500ms delay

  // --- Constants ---
  // Use environment variables for sensitive data like API keys and IDs
  const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID || "YOUR_GHL_LOCATION_ID"; // Replace with your location ID or env var
  const GHL_PET_OBJECT_KEY = "custom_objects.pets";
  const GHL_PET_NAME_FIELD_KEY = "custom_objects.pets.name"; // Corrected the field key based on petFields data

  // Target Calendar IDs for scheduled dogs
  const TARGET_CALENDAR_IDS = [
    '8A8sN0yeST6qSmRZ85Dl', // Small Group
    'bbNCMyLoBqCKwp4IrZzE', // Medium Group
    'GmhrXLC9VYsmFNLXWg1x', // Large Group
    'Mio0TwZKlZRwXEQIJ1FC', // Buddy Play
    'RPGNTsMRo8yJpuALjPOM'  // Play School
  ];

  // --- Mobile touch move state ---
  const [mobileMoveDogId, setMobileMoveDogId] = useState<string | null>(null);

  // --- Helper Functions (defined in parent scope) ---

  // Helper to parse dog name from event title (adjust regex as needed)
  const parseDogNameFromTitle = (title: string): string | null => {
      // Example patterns:
      // "Boarding - Barry (Nala's Den)" -> Barry
      // "Daycare - Fido" -> Fido
      // "Grooming: Spot" -> Spot
      const patterns = [
          /- ([^\(]+) \(/, // Matches "- Name (" structure
          /- (.*)$/,        // Matches "- Name" at the end
          /: (.*)$/         // Matches ": Name" at the end
      ];

      for (const pattern of patterns) {
          const match = title.match(pattern);
          if (match && match[1]) {
              return match[1].trim();
          }
      }
      console.warn(`Could not parse dog name from title: "${title}"`);
      return null; // Or potentially return the whole title or part of it as a fallback
  };

  // --- Effects ---

  // --- NEW: Effect to Fetch Today's Scheduled Dogs on Mount ---
  useEffect(() => {
      const fetchTodaysScheduledDogs = async (): Promise<Dog[]> => {
          if (!GHL_LOCATION_ID || GHL_LOCATION_ID === "YOUR_GHL_LOCATION_ID") {
              console.warn("GHL Location ID not configured. Skipping scheduled dog fetch.");
              return [];
          }

          console.log("Fetching today's scheduled dogs...");
          const today = new Date();
          const startTime = new Date(today.setHours(0, 0, 0, 0));
          const endTime = new Date(today.setHours(23, 59, 59, 999));

          const startTimeMillis = startTime.getTime();
          const endTimeMillis = endTime.getTime();

          const allDogPromises: Promise<Dog | null>[] = [];
          const processedPetIds = new Set<string>(); // Track processed pet IDs to avoid duplicates

          for (const calendarId of TARGET_CALENDAR_IDS) {
              try {
                  const events = await getCalendarEvents(calendarId, startTimeMillis, endTimeMillis, GHL_LOCATION_ID);
                  console.log(`Found ${events.length} events for calendar ${calendarId}`);

                  for (const event of events) {
                      if (event.appointmentStatus === 'cancelled' || !event.contactId) {
                          console.log(`Skipping event ${event.id} (status: ${event.appointmentStatus}, contactId: ${event.contactId})`);
                          continue; // Skip cancelled or events without contacts
                      }

                      const contactId = event.contactId;
                      const petIds = await getAssociatedPetIds(contactId, GHL_LOCATION_ID);

                      if (petIds.length === 0) {
                          console.log(`No pets found associated with contact ${contactId} for event ${event.id}`);
                          continue;
                      }

                      let targetPetId: string | null = null;

                      if (petIds.length === 1) {
                          targetPetId = petIds[0];
                          console.log(`Single pet found for contact ${contactId}: ${targetPetId}`);
                      } else {
                          console.log(`Multiple pets (${petIds.length}) found for contact ${contactId}, parsing title: "${event.title}"`);
                          const parsedName = parseDogNameFromTitle(event.title);
                          if (parsedName) {
                              // Fetch details for all pets to find the match by name
                              const petDetailsPromises = petIds.map(id => getPetRecordById(id, GHL_LOCATION_ID));
                              const petRecords = (await Promise.all(petDetailsPromises)).filter(Boolean) as GhlPetRecord[];

                              const matchedPet = petRecords.find(pet => {
                                  const petName = pet.properties?.name || pet.properties?.[GHL_PET_NAME_FIELD_KEY];
                                  return petName && petName.toLowerCase() === parsedName.toLowerCase();
                              });

                              if (matchedPet) {
                                  targetPetId = matchedPet.id;
                                  console.log(`Matched pet by name "${parsedName}": ${targetPetId}`);
                              } else {
                                  console.warn(`Could not find pet matching name "${parsedName}" from title "${event.title}" among IDs: ${petIds.join(', ')}`);
                              }
                          } else {
                              console.warn(`Could not parse name from title "${event.title}" for multi-pet contact ${contactId}. Skipping event.`);
                          }
                      }

                      if (targetPetId && !processedPetIds.has(targetPetId)) {
                          processedPetIds.add(targetPetId); // Mark as processed
                          // Add promise to fetch and map this pet
                          allDogPromises.push(
                              getPetRecordById(targetPetId, GHL_LOCATION_ID).then(petRecord => {
                                  if (petRecord) {
                                      const dog = mapGhlPetToDog(petRecord);
                                      // Ensure initial location is pool
                                      dog.location = { area: null, position: null };
                                      return dog;
                                  }
                                  return null;
                              })
                          );
                      }
                  }
              } catch (error) {
                  console.error(`Error processing calendar ${calendarId}:`, error);
                  // Optionally set error state here
              }
          }

          // Wait for all pet fetching and mapping promises to resolve
          const resolvedDogs = (await Promise.all(allDogPromises)).filter(Boolean) as Dog[];
          console.log(`Finished fetching scheduled dogs. Found ${resolvedDogs.length} unique dogs.`);
          return resolvedDogs;
      };

      // --- Execution Logic ---
      const initializeDogs = async () => {
          setIsLoadingScheduledDogs(true);
          setFetchScheduledDogsError(null);
          try {
              // Clear any existing dog data in localStorage (still good practice)
              localStorage.removeItem('dogWhiteboardData');

              const scheduledDogs = await fetchTodaysScheduledDogs();
              const normalizedDogs = scheduledDogs.map(normalizeDogRecord);
              if (normalizedDogs.length > 0) {
                setDogs(normalizedDogs);
              }
          } catch (error) {
              console.error("Error fetching scheduled dogs on mount:", error);
              setFetchScheduledDogsError("Failed to load scheduled dogs. Please try refreshing.");
              
          } finally {
              setIsLoadingScheduledDogs(false);
          }
      };

      initializeDogs();

      // Placeholder for fetching staff data if needed in the future
      // fetchStaffData().then(setStaff);

  }, []); // Empty dependency array ensures this runs only once on mount

  // Remove localStorage saving
  useEffect(() => {
    // Do not save dogs data to localStorage
  }, [dogs]); // Keep the dependency to avoid lint errors

  // Restore useEffect for processing scheduled moves
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      let dogsUpdated = false;
      const updatedDogs = dogs.map(dog => {
        const pendingMoves = (dog.scheduledMoves || [])
            .filter((move: ScheduledMove) => !move.completed && new Date(move.scheduledTime).getTime() <= now.getTime()) // Added type
            .sort((a: ScheduledMove, b: ScheduledMove) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()); // Added types

        if (pendingMoves.length > 0) {
          const moveToProcess = pendingMoves[0]; // The earliest pending move
          // Check for conflicts before moving
          if (moveToProcess.targetArea && moveToProcess.targetPosition) {
             const conflict = dogs.some(d =>
                d.id !== dog.id && // Don't conflict with self
                d.location.area === moveToProcess.targetArea &&
                d.location.position === moveToProcess.targetPosition
             );
             if (conflict) {
                 console.warn(`Scheduled move conflict for dog ${dog.id} to ${moveToProcess.targetArea} pos ${moveToProcess.targetPosition}. Skipping.`);
                 // Optionally mark the move as failed or reschedule
                 return dog; // Skip this update for now
             }
          }

          dogsUpdated = true;
          const newHistoryEntry: LocationHistoryEntry = {
              area: moveToProcess.targetArea,
              position: moveToProcess.targetPosition,
              timestamp: now
          };
          // Mark the processed move as completed
          const updatedScheduledMoves = (dog.scheduledMoves || []).map((move: ScheduledMove) => // Added type
            move.id === moveToProcess.id ? { ...move, completed: true } : move
          );

          return {
            ...dog,
            location: { area: moveToProcess.targetArea, position: moveToProcess.targetPosition },
            lastUpdated: now,
            locationHistory: [...(dog.locationHistory || []), newHistoryEntry],
            scheduledMoves: updatedScheduledMoves
          };
        }
        return dog;
      });

      if (dogsUpdated) {
        setDogs(updatedDogs);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [dogs]); // Rerun effect if dogs array changes

  // --- Effect to fetch GHL Pet Records based on debounced search query ---
  useEffect(() => {
    const fetchGhlPets = async () => {
      // Basic validation for Location ID (API key is handled by axios instance)
      if (!GHL_LOCATION_ID || GHL_LOCATION_ID === "YOUR_GHL_LOCATION_ID") {
        console.warn("GHL Location ID not configured. Skipping GHL Pet fetch.");
        return;
      }

      // Trim the query and check length
      const trimmedQuery = debouncedGhlSearchQuery.trim();
      if (trimmedQuery.length < 3) {
        setGhlPets([]); // Clear suggestions if query is too short
        setIsFetchingGhlPets(false);
        return;
      }

      // Clear previous selection when initiating a new search
      if (selectedGhlPetId) {
        setSelectedGhlPetId(null);
      }

      setIsFetchingGhlPets(true);
      setGhlPets([]); // Clear previous suggestions immediately

      // Construct the filters array based on the new documentation
      const filters = [
        {
          field: 'properties.name', // Target the 'name' field within properties
          operator: 'contains',     // Use 'contains' for partial matching
          value: trimmedQuery       // The user's search term
        }
      ];

      // Log the exact filters being sent
      console.log(`Attempting to search GHL Pets with filters:`, JSON.stringify(filters, null, 2), `in location: ${GHL_LOCATION_ID}`);

      try {
        // Use the imported function from api.ts with filters
        const records = await searchCustomObjectRecords(
            GHL_PET_OBJECT_KEY,
            GHL_LOCATION_ID, // Pass location ID explicitly
            filters,         // Pass the filters array
            10               // Limit suggestions
        );
        // Use the correct response key based on new docs
        const actualRecords = records || [];
        setGhlPets(actualRecords);
        // Log the full structure of the fetched records
        console.log(`Fetched GHL Pets for query "${trimmedQuery}":`, JSON.stringify(actualRecords, null, 2));

      } catch (error) {
        console.error("Error fetching GHL pet records:", error);
        setGhlPets([]); // Clear pets on error
      } finally {
        setIsFetchingGhlPets(false);
      }
    };

    fetchGhlPets();
  // Depend on the *debounced* query, Location ID, Object Key
  }, [debouncedGhlSearchQuery, GHL_LOCATION_ID, GHL_PET_OBJECT_KEY, selectedGhlPetId]);

  // --- State Modifying Callbacks ---
  // Removed assignStaffToDog function

  // Restore deleteScheduledMove callback
  const deleteScheduledMove = useCallback((dogId: string, moveId: string) => {
    setDogs(prev => prev.map(dog => {
      if (dog.id === dogId) {
        return { ...dog, scheduledMoves: (dog.scheduledMoves || []).filter((move: ScheduledMove) => move.id !== moveId) }; // Added type
      }
      return dog;
    }));
  }, []);

  // Restore handleImportDog callback with GHL ID preservation
  const handleImportDog = useCallback((dogData: Partial<Dog> & { id: string }) => {
    setDogs(prev => {
      const exists = prev.some(dog => dog.id === dogData.id);
      if (exists) {
        // Update existing dog, carefully merging fields and preserving location/history/schedule
        return prev.map(dog => {
          if (dog.id === dogData.id) {
            return normalizeDogRecord({
              ...dog, // Keep existing data
              ...dogData, // Override with imported data
              // Explicitly preserve dynamic state:
              location: dog.location,
              lastUpdated: dog.lastUpdated,
              locationHistory: dog.locationHistory || [],
              scheduledMoves: dog.scheduledMoves || [],
              assignedStaff: dog.assignedStaff, // Preserve assigned staff unless explicitly changed by import
              id: dogData.id // Ensure we preserve the GHL ID for association lookup
            });
          }
          return dog;
        });
      } else {
        // Add new dog with defaults
        const newDog: Dog = {
          // Provide defaults for all required Dog fields
          name: 'Unknown Name',
          breed: 'Unknown Breed',
          color: null,
          traits: [],
          assignedStaff: null,
          location: { area: null, position: null }, // Start in the pool
          lastUpdated: new Date(),
          locationHistory: [],
          scheduledMoves: [],
          owner: undefined, // Ensure all optional fields are handled
          ownerPhone: undefined,
          emergencyContact: undefined,
          emergencyPhone: undefined,
          veterinarian: undefined,
          vetPhone: undefined,
          medications: [],
          feedingSchedule: undefined,
          notes: undefined,
          // Spread imported data over defaults
          ...dogData,
          id: dogData.id // Ensure ID is set to the GHL pet ID for association lookup
        };
        return [...prev, normalizeDogRecord(newDog)];
      }
    });
  }, []);

  // Handle import of a GHL Pet
  const handleImportGhlPet = useCallback(async (pet: GhlPetRecord) => {
    if (!pet || !pet.id) return;

    // Use the mapGhlPetToDog utility
    const mappedDog = mapGhlPetToDog(pet);

    // Ensure id is correctly passed (it's part of mappedDog)
    const newDogData: Partial<Dog> & { id: string } = {
        ...mappedDog,
        // Override specific fields if needed, but mapGhlPetToDog should handle most
    };

    console.log(`Importing pet with data:`, newDogData);

    // Use the existing handleImportDog logic which merges/adds to state
    handleImportDog(newDogData);

    // Close the import panel and select the newly imported dog
    setShowImport(false);
    setSelectedGhlPetId(pet.id); // Keep track of GHL ID selection if needed

    // Find the dog in the *updated* dogs array and set it as selected
    // Need to access the state *after* it updates, potentially using a follow-up effect
    // For now, let's assume handleImportDog updates state sync enough for filtering
    // Or, pass the mappedDog directly to setSelectedDog if handleImportDog logic is complex
    // setDogs(currentDogs => { ... find and set selectedDog }); // Safer way
    const findAndSetSelected = () => {
      setDogs(currentDogs => {
         const importedDog = currentDogs.find(d => d.id === pet.id);
         if (importedDog) {
           setSelectedDog(importedDog);
         }
         return currentDogs; // Return currentDogs to prevent state change loop if not found
      });
    };
    findAndSetSelected(); // Call the function to update selectedDog based on new state

  }, [handleImportDog, mapGhlPetToDog]); // Add mapGhlPetToDog dependency

  // --- Drag and Drop Handlers ---
  const handleDragStart = useCallback((e: React.DragEvent, dogId: string) => {
    e.dataTransfer.setData('dogId', dogId);
    // Clear any touch selection so desktop drag does not interfere
    setMobileMoveDogId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const performMove = (dogId: string, targetArea: LocationArea | null, targetPosition: number | null) => {
    const now = new Date();
    const currentDog = dogs.find(d => d.id === dogId);
    if (!currentDog) return;

    const normalizedArea = targetArea === null ? null : normalizeLocationArea(targetArea);

    // Check if target spot is occupied by a *different* dog (only if not dropping into the pool)
    if (normalizedArea !== null && targetPosition !== null) {
      const occupyingDog = dogs.find(d => d.location.area === normalizedArea && d.location.position === targetPosition);
      if (occupyingDog && occupyingDog.id !== dogId) {
        console.warn('Target position occupied');
        return; // Prevent drop
      }
    }

    // Update only if location actually changed or moving to/from pool
    if (currentDog.location.area !== normalizedArea || currentDog.location.position !== targetPosition) {
      const newHistoryEntry: LocationHistoryEntry = { area: normalizedArea, position: targetPosition, timestamp: now };
      setDogs(prev => prev.map(dog =>
        dog.id === dogId
          ? {
              ...dog,
              location: { area: normalizedArea, position: targetPosition },
              lastUpdated: now,
              locationHistory: [...(dog.locationHistory || []), newHistoryEntry],
            }
          : dog
      ));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent, targetArea: LocationArea | null, targetPosition: number | null) => { // Allow null targetArea
    e.preventDefault();
    const dogId = e.dataTransfer.getData('dogId');
    if (!dogId) return;
    performMove(dogId, targetArea, targetPosition);
  }, [dogs]); // Added dogs dependency

  // Handle mobile drop via tap
  const handleMobileDrop = useCallback((targetArea: LocationArea | null, targetPosition: number | null) => {
    if (!mobileMoveDogId) return;
    performMove(mobileMoveDogId, targetArea, targetPosition);
    setMobileMoveDogId(null);
  }, [mobileMoveDogId, dogs]);

  const getDogStatuses = useCallback((dog: Dog): Set<GroupStatusFilter> => {
    const statuses = new Set<GroupStatusFilter>();
    const area = dog.location.area;

    if (!area) {
      statuses.add('checked_out');
      return statuses;
    }

    statuses.add('checked_in');

    const normalized = normalizeLocationArea(area) as GroupType | null;
    if (normalized && (primaryGroupKeys as readonly string[]).includes(normalized)) {
      statuses.add('in_group');
    }

    if (BOARDING_RUN_LOCATIONS.has(area)) {
      statuses.add('in_kennel');
    }

    return statuses;
  }, []);

  // --- Filtering Logic ---
  const filteredDogs = useMemo(() => dogs.filter(dog => {
    // --- Filter by Selected GHL Pet ---
    // If a GHL pet is selected, only show the matching local dog (assuming IDs match)
    // Note: This assumes dog.id from local state corresponds to GHL record id.
    // Adjust if your local ID mapping is different.
    if (selectedGhlPetId && dog.id !== selectedGhlPetId) {
        return false;
    }

    // --- Existing Filters (excluding search query) ---
    const matchesLocation = locationFilter === '' ||
      (locationFilter === 'available' ? dog.location.area === null : dog.location.area === locationFilter);

    const matchesTrait = traitFilter === '' ||
      (dog.traits && dog.traits.some((trait: string) => trait.toLowerCase().includes(traitFilter.toLowerCase()))); // Added type

    const matchesStaff = !selectedStaffId ||
      (selectedStaffId === 'unassigned' ? !dog.assignedStaff : dog.assignedStaff === selectedStaffId);

    const normalizedArea = normalizeLocationArea(dog.location.area) as GroupType | null;
    const matchesGroupType = groupTypeFilter === '' || normalizedArea === groupTypeFilter;
    const matchesStatus = statusFilter === 'all' || getDogStatuses(dog).has(statusFilter);

    // Combine filters: GHL selection (if active) AND other filters
    return matchesLocation && matchesTrait && matchesStaff && matchesGroupType && matchesStatus;

  }), [dogs, locationFilter, traitFilter, selectedStaffId, selectedGhlPetId, groupTypeFilter, statusFilter, getDogStatuses]);

  const occupancyByArea = useMemo(() => {
    const counts = primaryGroupKeys.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<PrimaryGroupKey, number>);

    filteredDogs.forEach(dog => {
      const normalized = normalizeLocationArea(dog.location.area) as GroupType | null;
      if (normalized && (primaryGroupKeys as readonly string[]).includes(normalized)) {
        counts[normalized as PrimaryGroupKey] += 1;
      }
    });

    return counts;
  }, [filteredDogs]);

  const orderedAreaKeys = useMemo<PrimaryGroupKey[]>(() => {
    if (columnSort === 'alpha') {
      return [...primaryGroupKeys].sort((a, b) =>
        GROUP_LABELS[a].localeCompare(GROUP_LABELS[b])
      );
    }

    if (columnSort === 'occupancy') {
      return [...primaryGroupKeys].sort((a, b) => {
        const diff = (occupancyByArea[b] ?? 0) - (occupancyByArea[a] ?? 0);
        return diff !== 0 ? diff : GROUP_LABELS[a].localeCompare(GROUP_LABELS[b]);
      });
    }

    return [...primaryGroupKeys];
  }, [columnSort, occupancyByArea]);

  const columnOneKeys = useMemo(
    () => orderedAreaKeys.filter(key => PRIMARY_COLUMN_SET.has(key)),
    [orderedAreaKeys]
  );
  const columnTwoKeys = useMemo(
    () => orderedAreaKeys.filter(key => SECONDARY_COLUMN_SET.has(key)),
    [orderedAreaKeys]
  );

  // Helper to get dogs in a specific position (used by DropZone potentially, keep for now)
  const getDogsInPosition = useCallback((area: LocationArea | null, position: number | null) => { // Allow null area/position
    return filteredDogs.filter(dog =>
      dog.location.area === area &&
      dog.location.position === position
    );
  }, [filteredDogs]);

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-12 pb-12 md:pt-16 md:pb-16">
        <div
          className="absolute bottom-0 left-0 right-0 h-32 bg-white"
          style={{ clipPath: 'ellipse(120% 60% at 50% 100%)', boxShadow: '0 -30px 60px rgba(0,0,0,0.05)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            <img
              src="/branding/pawhootz/PawHootz Logo (1).png"
              alt="PawHootz Pet Resort"
              className="mb-2 md:mb-4 w-96 max-w-full drop-shadow-lg"
            />
            <h1 className="hero-heading text-2xl md:text-3xl font-semibold text-[var(--phz-purple)] uppercase tracking-wide">
              Whiteboard
            </h1>
          </div>
        </div>
      </section>

      {/* Play Area Status Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">

          {/* --- NEW: Loading/Error Display for Scheduled Dogs --- */}
          {isLoadingScheduledDogs && (
            <div className="text-center p-4 bg-blue-100 border border-blue-300 rounded-md mb-6">
              <p className="font-semibold text-blue-800">Loading scheduled dogs...</p>
            </div>
          )}
          {fetchScheduledDogsError && (
            <div className="text-center p-4 bg-red-100 border border-red-300 rounded-md mb-6">
              <p className="font-semibold text-red-800">Error: {fetchScheduledDogsError}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Search and Filter Bar - Adjust props */}
            <SearchFilterBar
               locationFilter={locationFilter}
               setLocationFilter={setLocationFilter}
               traitFilter={traitFilter}
               setTraitFilter={setTraitFilter}
               selectedStaff={selectedStaffId}
               setSelectedStaff={setSelectedStaffId}
               staff={staff}
               showAlerts={showAlerts}
               setShowAlerts={setShowAlerts}
               showScheduler={showScheduler}
               setShowScheduler={setShowScheduler}
               showImport={showImport}
               setShowImport={setShowImport}
               // GHL props for Autocomplete
               ghlSearchQuery={ghlSearchQuery}
               setGhlSearchQuery={setGhlSearchQuery}
               ghlPets={ghlPets} // Suggestions
               selectedGhlPetId={selectedGhlPetId} // To indicate selection
               setSelectedGhlPetId={setSelectedGhlPetId} // To set selection
               ghlPetNameFieldKey={GHL_PET_NAME_FIELD_KEY} 
               isFetchingGhlPets={isFetchingGhlPets}
               onImportGhlPet={handleImportGhlPet} // Add new prop
               groupTypeFilter={groupTypeFilter}
               setGroupTypeFilter={setGroupTypeFilter}
               statusFilter={statusFilter}
               setStatusFilter={setStatusFilter}
               columnSort={columnSort}
               setColumnSort={setColumnSort}
            />

             {/* GoHighLevel Import Section - Removed GHLBulkImport */}
             {showImport && (
               <div className="space-y-4 bg-gray-50 p-6 rounded-xl shadow">
                 <h3 className="text-xl font-bold text-[var(--phz-purple)] mb-4 border-b border-[var(--phz-purple)]/20 pb-2">Import Contacts from GoHighLevel</h3>
                 {/* Render only GHLContactSearch */}
                 <GHLContactSearch onImportDog={handleImportDog} />
               </div>
             )}

            {/* Alerts Panel removed */}

            {/* Scheduler Panel - Adjust props */}
            {showScheduler && (
              <SchedulerPanel
                dogs={dogs}
                showScheduler={showScheduler}
                deleteScheduledMove={deleteScheduledMove}
                setSelectedDog={setSelectedDog}
              />
            )}

            {/* Side-by-side layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Dog Pool on the left */}
              <div className="lg:w-1/3 lg:max-w-sm flex-shrink-0">
                <DogPool
                  poolDogs={filteredDogs.filter(dog => !dog.location.area)}
                  handleDrop={handleDrop}
                  handleDragOver={handleDragOver}
                  setSelectedDog={setSelectedDog}
                  handleDragStart={handleDragStart}
                  mobileMoveDogId={mobileMoveDogId}
                  setMobileMoveDogId={setMobileMoveDogId}
                  handleMobileDrop={handleMobileDrop}
                />
              </div>

              {/* Play Areas on the right */}
              <div className="flex-1">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-6">
                    {columnOneKeys.map(areaKey => (
                      <AreaSection
                        key={areaKey}
                        area={areaKey}
                        title={areaConfigs[areaKey].title}
                        positions={areaConfigs[areaKey].positions}
                        dogs={filteredDogs}
                        getDogsInPosition={getDogsInPosition}
                        handleDrop={handleDrop}
                        handleDragOver={handleDragOver}
                        setSelectedDog={setSelectedDog}
                        handleDragStart={handleDragStart}
                        mobileMoveDogId={mobileMoveDogId}
                        setMobileMoveDogId={setMobileMoveDogId}
                        handleMobileDrop={handleMobileDrop}
                      />
                    ))}
                  </div>
                  <div className="space-y-6">
                    {columnTwoKeys.map(areaKey => (
                      <AreaSection
                        key={areaKey}
                        area={areaKey}
                        title={areaConfigs[areaKey].title}
                        positions={areaConfigs[areaKey].positions}
                        dogs={filteredDogs}
                        getDogsInPosition={getDogsInPosition}
                        handleDrop={handleDrop}
                        handleDragOver={handleDragOver}
                        setSelectedDog={setSelectedDog}
                        handleDragStart={handleDragStart}
                        mobileMoveDogId={mobileMoveDogId}
                        setMobileMoveDogId={setMobileMoveDogId}
                        handleMobileDrop={handleMobileDrop}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Menu Section removed */}

      {/* Dog Details Modal - Adjust props */}
      {selectedDog && (
        <DogDetailsModal
           dog={selectedDog}
           onClose={() => setSelectedDog(null)}
        />
      )}
    </div>
  );
}



