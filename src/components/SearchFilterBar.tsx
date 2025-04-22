import React from 'react';
import { Staff } from '../types/types';

// Define a type for the GHL Pet record structure (mirroring EmployeeResourcesPage)
interface GhlPetRecord {
  id: string;
  properties: {
    [key: string]: any; 
  };
}

interface SearchFilterBarProps {
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
  traitFilter: string;
  setTraitFilter: (filter: string) => void;
  selectedStaff: string | null;
  setSelectedStaff: (staffId: string | null) => void;
  staff: Staff[];
  showAlerts: boolean;
  setShowAlerts: (show: boolean) => void;
  showScheduler: boolean;
  setShowScheduler: (show: boolean) => void;
  showImport: boolean;
  setShowImport: (show: boolean) => void;
  // GHL Autocomplete Props
  ghlSearchQuery: string; 
  setGhlSearchQuery: (query: string) => void;
  ghlPets: GhlPetRecord[]; // Suggestions
  selectedGhlPetId: string | null; // ID of the selected pet (if any)
  setSelectedGhlPetId: (id: string | null) => void; // Function to set the selected pet ID
  ghlPetNameFieldKey: string;
  isFetchingGhlPets: boolean; // To show loading indicator
  // New prop for importing a pet
  onImportGhlPet: (pet: GhlPetRecord) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  locationFilter, setLocationFilter,
  traitFilter, setTraitFilter,
  selectedStaff, setSelectedStaff,
  staff,
  showAlerts, setShowAlerts,
  showScheduler, setShowScheduler,
  showImport, setShowImport,
  // GHL Autocomplete Props
  ghlSearchQuery,
  setGhlSearchQuery,
  ghlPets,
  selectedGhlPetId,
  setSelectedGhlPetId,
  ghlPetNameFieldKey,
  isFetchingGhlPets,
  // New prop
  onImportGhlPet
}) => {

  // Extract the short field name (e.g., "name" from "custom_objects.pets.name")
  const shortFieldName = ghlPetNameFieldKey.split('.').pop();

  const handleSuggestionClick = (pet: GhlPetRecord) => {
    // Use the short field name to access the property, or the full key as fallback, then ID
    const petName = (shortFieldName && pet.properties?.[shortFieldName]) || 
                    pet.properties?.[ghlPetNameFieldKey] || 
                    `Pet ID: ${pet.id}`;
    setGhlSearchQuery(petName); // Update input to show selected name
    setSelectedGhlPetId(pet.id); // Set the selected ID for filtering
    
    // Import the pet to create a dog card
    onImportGhlPet(pet);
    
    // Suggestions will automatically hide because EmployeeResourcesPage will clear ghlPets on query change 
    // or when query length < 3 after selection.
  };

  const showSuggestions = ghlSearchQuery.length >= 3 && !selectedGhlPetId;

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-[#005596] mb-4">Search Pet</h3>
      <div>
        {/* GHL Pet Search Input */}
        <div className="relative"> {/* Added relative positioning for suggestions */}
          <input 
            id="ghlPetSearch"
            type="text"
            placeholder="Type pet name (min 3 chars)..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={ghlSearchQuery}
            onChange={e => {
              setGhlSearchQuery(e.target.value);
              // Clear selection if user starts typing again
              if (selectedGhlPetId) {
                setSelectedGhlPetId(null);
              }
            }}
            autoComplete="off" // Prevent browser autocomplete
          />
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {isFetchingGhlPets && <div className="p-2 text-gray-500">Loading...</div>}
              {!isFetchingGhlPets && ghlPets.length === 0 && ghlSearchQuery.length >= 3 && (
                <div className="p-2 text-gray-500">No pets found matching "{ghlSearchQuery}".</div>
              )}
              {!isFetchingGhlPets && ghlPets.map(pet => (
                <div
                  key={pet.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(pet)}
                >
                  {/* Use the short field name to access the property, or the full key as fallback, then ID */}
                  {(shortFieldName && pet.properties?.[shortFieldName]) || 
                   pet.properties?.[ghlPetNameFieldKey] || 
                   `Pet ID: ${pet.id}`}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 