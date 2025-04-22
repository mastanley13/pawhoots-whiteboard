import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dog, Staff, LocationHistoryEntry, ScheduledMove, LocationArea } from './types/types'; // Removed DogColor import
import { DogDetailsModal } from './components/DogDetailsModal';
import { SearchFilterBar } from './components/SearchFilterBar';
import { SchedulerPanel } from './components/SchedulerPanel';
import { DogPool } from './components/DogPool';
import { BoardingRunsSection } from './components/BoardingRunsSection';
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

// Define a type for the GHL Pet record structure (adjust based on actual GHL response)
// REMOVED - Now imported from api.ts
// interface GhlPetRecord { ... }

// Removed areaConfigs as it's likely managed within AreaSection/BoardingRunsSection now

// Type for the keys of areaConfigs (Keep if needed by LocationArea type or other logic)
// Define area configurations including capacity (Moved here if needed, otherwise remove)
const areaConfigs = {
  yard1: { title: 'Yard 1', positions: 12 },
  yard2: { title: 'Yard 2', positions: 12 },
  lobby: { title: 'Lobby', positions: 9 },
  smallDogSuite: { title: 'Small Dog Suite', positions: 6 },
  training: { title: 'Training', positions: 4 },
  runs: { title: 'Runs', positions: 8 }, // Added missing areas
  chucksAlley: { title: 'Chuck\'s Alley', positions: 8 },
  nalasDen: { title: 'Nala\'s Den', positions: 8 },
  trinsTown: { title: 'Trin\'s Town', positions: 8 },
} as const;

// type PlayAreaKey = keyof typeof areaConfigs; // Keep if needed

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
  const [dogs, setDogs] = useState<Dog[]>([]); // Initial state is empty
  const [staff] = useState<Staff[]>([]); // Empty array, no mock staff

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
    '8A8sN0yeST6qSmRZ85Dl', // Yard 1
    'bbNCMyLoBqCKwp4IrZzE', // Yard 2
    'GmhrXLC9VYsmFNLXWg1x', // Nala's Den
    'Mio0TwZKlZRwXEQIJ1FC', // Trin's Town
    'RPGNTsMRo8yJpuALjPOM'  // Chuck's Alley
  ];

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
              setDogs(scheduledDogs); // Set initial state with scheduled dogs
          } catch (error) {
              console.error("Error fetching scheduled dogs on mount:", error);
              setFetchScheduledDogsError("Failed to load scheduled dogs. Please try refreshing.");
              setDogs([]); // Set to empty on error
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
            return {
              ...dog, // Keep existing data
              ...dogData, // Override with imported data
              // Explicitly preserve dynamic state:
              location: dog.location,
              lastUpdated: dog.lastUpdated,
              locationHistory: dog.locationHistory || [],
              scheduledMoves: dog.scheduledMoves || [],
              assignedStaff: dog.assignedStaff, // Preserve assigned staff unless explicitly changed by import
              id: dogData.id // Ensure we preserve the GHL ID for association lookup
            };
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
        return [...prev, newDog];
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
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetArea: LocationArea | null, targetPosition: number | null) => { // Allow null targetArea
    e.preventDefault();
    const dogId = e.dataTransfer.getData('dogId');
    if (!dogId) return;

    const now = new Date();
    const currentDog = dogs.find(d => d.id === dogId);
    if (!currentDog) return;

    // Check if target spot is occupied by a *different* dog (only if not dropping into the pool)
    if (targetArea !== null && targetPosition !== null) {
      const occupyingDog = dogs.find(d => d.location.area === targetArea && d.location.position === targetPosition);
      if (occupyingDog && occupyingDog.id !== dogId) {
        console.warn("Target position occupied");
        return; // Prevent drop
      }
    }

    // Update only if location actually changed or moving to/from pool
    if (currentDog.location.area !== targetArea || currentDog.location.position !== targetPosition) {
       const newHistoryEntry: LocationHistoryEntry = { area: targetArea, position: targetPosition, timestamp: now };
       setDogs(prev => prev.map(dog =>
         dog.id === dogId
           ? {
               ...dog,
               location: { area: targetArea, position: targetPosition },
               lastUpdated: now,
               locationHistory: [...(dog.locationHistory || []), newHistoryEntry],
             }
           : dog
       ));
    }
  }, [dogs]); // Added dogs dependency

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

    // Combine filters: GHL selection (if active) AND other filters
    return matchesLocation && matchesTrait && matchesStaff;

  }), [dogs, locationFilter, traitFilter, selectedStaffId, selectedGhlPetId]); // Use selectedGhlPetId for filtering

  // Helper to get dogs in a specific position (used by DropZone potentially, keep for now)
  const getDogsInPosition = useCallback((area: LocationArea | null, position: number | null) => { // Allow null area/position
    return dogs.filter(dog =>
      dog.location.area === area &&
      dog.location.position === position
    );
  }, [dogs]); // Added dogs dependency

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#005596] text-white pt-32 pb-16 relative overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10">
           <div className="absolute inset-0" style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }}></div>
         </div>

         <div className="container mx-auto px-4 relative">
           <div className="flex flex-col items-center">
             {/* Icon Container */}
             <div className="bg-white rounded-full p-4 mb-8 shadow-lg w-32 h-32 flex items-center justify-center overflow-hidden border-4 border-[#d32f2f] border-opacity-50">
               <img
                 src="https://storage.googleapis.com/msgsndr/mGAU84INytusQO0Fo5P9/media/6798fd8c4f0aeba1445fcd49.gif"
                 alt="Employee Resources"
                 className="w-full h-full object-cover"
               />
             </div>
            <h1 className="hero-heading text-5xl text-center mb-6">Dog Whiteboard</h1>
            <p className="text-xl text-center max-w-2xl mx-auto">
              Manage and track dogs across different areas of Champ's Dog House
            </p>
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
            />

             {/* GoHighLevel Import Section - Removed GHLBulkImport */}
             {showImport && (
               <div className="space-y-4 bg-gray-50 p-6 rounded-xl shadow">
                 <h3 className="text-xl font-bold text-[#005596] mb-4 border-b pb-2">Import Contacts from GoHighLevel</h3>
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

            {/* Dog Pool - Adjust props */}
            <DogPool
               poolDogs={filteredDogs.filter(dog => !dog.location.area)}
               handleDrop={handleDrop}
               handleDragOver={handleDragOver}
               setSelectedDog={setSelectedDog}
               handleDragStart={handleDragStart}
             />

            {/* Boarding Runs - Adjust props */}
            <BoardingRunsSection
               dogs={dogs}
               getDogsInPosition={getDogsInPosition}
               handleDrop={handleDrop}
               handleDragOver={handleDragOver}
               setSelectedDog={setSelectedDog}
               handleDragStart={handleDragStart}
            />

            {/* Play Areas Grid - Adjust props */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
               {(Object.keys(areaConfigs) as Array<keyof typeof areaConfigs>)
                 .filter(key => !['runs', 'chucksAlley', 'nalasDen', 'trinsTown'].includes(key))
                 .map(areaKey => (
                   <AreaSection
                     key={areaKey}
                     area={areaKey}
                     title={areaConfigs[areaKey].title}
                     positions={areaConfigs[areaKey].positions}
                     dogs={dogs}
                     getDogsInPosition={getDogsInPosition}
                     handleDrop={handleDrop}
                     handleDragOver={handleDragOver}
                     setSelectedDog={setSelectedDog}
                     handleDragStart={handleDragStart}
                   />
               ))}
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
