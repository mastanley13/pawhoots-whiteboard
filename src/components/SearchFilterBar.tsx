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
  isFetchingGhlPets
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
    // Suggestions will automatically hide because EmployeeResourcesPage will clear ghlPets on query change 
    // or when query length < 3 after selection.
  };

  const showSuggestions = ghlSearchQuery.length >= 3 && !selectedGhlPetId;

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold text-[#005596] mb-4">Search & Filter</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* GHL Pet Search Input */}
        <div className="relative"> {/* Added relative positioning for suggestions */}
          <label htmlFor="ghlPetSearch" className="block text-sm font-medium text-gray-700 mb-1">Search GHL Pet</label>
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
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Filter by Location</label>
          <select 
            id="location"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="yard1">Yard 1</option>
            <option value="yard2">Yard 2</option>
            <option value="lobby">Lobby</option>
            <option value="smallDogSuite">Small Dog Suite</option>
            <option value="training">Training</option>
            <option value="runs">Runs</option>
            <option value="chucksAlley">Chuck's Alley</option>
            <option value="nalasDen">Nala's Den</option>
            <option value="trinsTown">Trin's Town</option>
            <option value="available">Available (Pool)</option>
          </select>
        </div>
        <div>
          <label htmlFor="trait" className="block text-sm font-medium text-gray-700 mb-1">Filter by Trait</label>
          <select 
            id="trait"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={traitFilter}
            onChange={e => setTraitFilter(e.target.value)}
          >
            <option value="">All Traits</option>
            <option value="jumper">Jumper</option>
            <option value="vocal">Vocal</option>
            <option value="protective">Protective</option>
            <option value="food-motivated">Food Motivated</option>
            <option value="energetic">Energetic</option>
            <option value="gentle">Gentle</option>
            <option value="friendly">Friendly</option>
            <option value="high-energy">High Energy</option>
            <option value="calm">Calm</option>
            <option value="good-with-kids">Good with Kids</option>
            <option value="well-trained">Well Trained</option>
            <option value="needs-training">Needs Training</option>
            <option value="cat-friendly">Cat Friendly</option>
            <option value="separation-anxiety">Separation Anxiety</option>
            <option value="trainable">Trainable</option>
            <option value="hypoallergenic">Hypoallergenic</option>
          </select>
        </div>
        <div>
          <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">Filter by Staff</label>
          <select 
            id="staff"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={selectedStaff || ''}
            onChange={e => setSelectedStaff(e.target.value || null)}
          >
            <option value="">All Staff</option>
            <option value="unassigned">Unassigned</option>
            {staff.map(staffMember => (
              <option key={staffMember.id} value={staffMember.id}>
                {staffMember.avatar} {staffMember.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-alerts"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={showAlerts}
              onChange={e => setShowAlerts(e.target.checked)}
            />
            <label htmlFor="show-alerts" className="ml-2 text-sm text-gray-700">
              Show Long Stay Alerts
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-scheduler"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={showScheduler}
              onChange={e => setShowScheduler(e.target.checked)}
            />
            <label htmlFor="show-scheduler" className="ml-2 text-sm text-gray-700">
              Show Scheduler
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-import"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={showImport}
              onChange={e => setShowImport(e.target.checked)}
            />
            <label htmlFor="show-import" className="ml-2 text-sm text-gray-700">
              Show GoHighLevel Import
            </label>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setLocationFilter('');
              setTraitFilter('');
              setSelectedStaff(null);
              setSelectedGhlPetId(null);
              setGhlSearchQuery(''); // Clear search input too
            }}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}; 