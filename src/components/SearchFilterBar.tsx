import React from 'react';
import { Staff } from '../types/types';
import { GROUP_LABELS, GROUP_TYPES, GroupType } from '../shared/constants/groups';

// Define a type for the GHL Pet record structure (mirroring EmployeeResourcesPage)
interface GhlPetRecord {
  id: string;
  properties: {
    [key: string]: any; 
  };
}

export type GroupStatusFilter = 'all' | 'checked_in' | 'checked_out' | 'in_group' | 'in_kennel';
export type ColumnSortOption = 'default' | 'alpha' | 'occupancy';

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
  groupTypeFilter: GroupType | '';
  setGroupTypeFilter: (groupType: GroupType | '') => void;
  statusFilter: GroupStatusFilter;
  setStatusFilter: (status: GroupStatusFilter) => void;
  columnSort: ColumnSortOption;
  setColumnSort: (option: ColumnSortOption) => void;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ 
  // locationFilter, setLocationFilter, // Removed unused
  // traitFilter, setTraitFilter, // Removed unused
  // selectedStaff, setSelectedStaff, // Removed unused
  // staff, // Removed unused
  // showAlerts, setShowAlerts, // Removed unused
  // showScheduler, setShowScheduler, // Removed unused
  // showImport, setShowImport, // Removed unused
  // GHL Autocomplete Props
  ghlSearchQuery,
  setGhlSearchQuery,
  ghlPets,
  selectedGhlPetId,
  setSelectedGhlPetId,
  ghlPetNameFieldKey,
  isFetchingGhlPets,
  // New prop
  onImportGhlPet,
  groupTypeFilter,
  setGroupTypeFilter,
  statusFilter,
  setStatusFilter,
  columnSort,
  setColumnSort
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
    <div className="mb-6 p-4 bg-white rounded-xl shadow-md space-y-4">
      <div>
        <h3 className="text-xl font-bold text-[var(--phz-purple)] mb-4">Search & Filters</h3>
        {/* GHL Pet Search Input */}
        <div className="relative"> {/* Added relative positioning for suggestions */}
          <input 
            id="ghlPetSearch"
            type="text"
            placeholder="Type pet name (min 3 chars)..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[var(--phz-blue)] focus:border-[var(--phz-blue)]"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="group-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Group Type
          </label>
          <select
            id="group-filter"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={groupTypeFilter}
            onChange={e => setGroupTypeFilter(e.target.value as GroupType | '')}
          >
            <option value="">All Groups</option>
            {GROUP_TYPES.map(type => (
              <option key={type} value={type}>
                {GROUP_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as GroupStatusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="checked_in">Checked-In</option>
            <option value="checked_out">Checked-Out</option>
            <option value="in_group">In-Group</option>
            <option value="in_kennel">In-Kennel</option>
          </select>
        </div>
        <div>
          <label htmlFor="column-sort" className="block text-sm font-medium text-gray-700 mb-1">
            Column Order
          </label>
          <select
            id="column-sort"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={columnSort}
            onChange={e => setColumnSort(e.target.value as ColumnSortOption)}
          >
            <option value="default">Default order</option>
            <option value="alpha">Alphabetical</option>
            <option value="occupancy">Occupancy (desc)</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 
