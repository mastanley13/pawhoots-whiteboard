import React, { useState, useEffect } from 'react';
import { Dog, GroupArea } from '../types/types';
import { formatTimeElapsed } from "../utils";
import { getPetOwnerContactDetails, getPetVaccineRecords, GhlVaccineRecord } from '../services/api';
import { ContactDetailsModal } from './ContactDetailsModal';
import { GROUP_LABELS } from '../shared/constants/groups';

interface DogDetailsModalProps {
  dog: Dog;
  onClose: () => void;
}

// Interface for owner contact details
export interface OwnerContact {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  locationId?: string;
  customFields?: Array<{
    id: string;
    value: string;
  }>;
  // Add additional fields that might be in the GHL response
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  tags?: string[];
  source?: string;
}

// NEW: Interface for the wrapper object received from the API call
interface ContactApiResponse {
  contact: OwnerContact;
  traceId?: string; // Include traceId if needed, mark as optional
}

export const DogDetailsModal: React.FC<DogDetailsModalProps> = ({ 
  dog, 
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [ownerContacts, setOwnerContacts] = useState<ContactApiResponse[]>([]); 
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<OwnerContact | null>(null);
  const [vaccineRecords, setVaccineRecords] = useState<GhlVaccineRecord[]>([]);
  const [isLoadingVaccines, setIsLoadingVaccines] = useState(false);

  // Get the most recent group and run assignments from location history
  const groupAreas = ['small', 'medium', 'large', 'buddy_play', 'play_school'] as const;

  const getMostRecentLocation = (locationType: 'group' | 'run'): string => {
    if (!dog.locationHistory || dog.locationHistory.length === 0) {
      return 'None';
    }
    
    // Filter for group or run locations and sort by timestamp (newest first)
    const filteredHistory = [...dog.locationHistory]
      .filter(entry => 
        locationType === 'group' 
          ? groupAreas.includes((entry.area || '') as typeof groupAreas[number])
          : entry.area === 'runs' || entry.area === 'chucksAlley' || entry.area === 'nalasDen' || entry.area === 'trinsTown'
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Return the area name if found, otherwise 'None'
    if (filteredHistory.length === 0) {
      return 'None';
    }

    const area = filteredHistory[0].area;
    if (locationType === 'group' && area) {
      return GROUP_LABELS[(area as GroupArea)] ?? area;
    }

    return area || 'None';
  };

  // Fetch owner contact details when the dog is selected
  useEffect(() => {
    const fetchOwnerContacts = async () => {
      if (!dog.id) return;
      
      setIsLoadingContacts(true);
      try {
        console.log(`Fetching owner contacts for pet ID: ${dog.id}`);
        const contacts = await getPetOwnerContactDetails(dog.id);
        console.log(`Received ${contacts.length} owner contacts:`, contacts);
        // Ensure the fetched data matches the ContactApiResponse structure
        // If getPetOwnerContactDetails already returns the correct structure, this is fine.
        // If not, we might need to map it here.
        setOwnerContacts(contacts as ContactApiResponse[]); // Assuming the structure matches
      } catch (error) {
        console.error('Error fetching owner contacts:', error);
        setOwnerContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    fetchOwnerContacts();
  }, [dog.id]);

  // Fetch vaccine records when the dog is selected
  useEffect(() => {
    const fetchVaccineRecords = async () => {
      if (!dog.id) return;
      
      setIsLoadingVaccines(true);
      try {
        console.log(`Fetching vaccine records for pet ID: ${dog.id}`);
        const records = await getPetVaccineRecords(dog.id);
        console.log(`Received ${records.length} vaccine records:`, records);
        setVaccineRecords(records);
      } catch (error) {
        console.error('Error fetching vaccine records:', error);
        setVaccineRecords([]);
      } finally {
        setIsLoadingVaccines(false);
      }
    };
    
    fetchVaccineRecords();
  }, [dog.id]);

  // Helper to format date string (handles null/undefined)
  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", dateStr, e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {/* Pet Profile Image */}
            {dog.profileImage ? (
              <div className="mr-4 w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--phz-purple)]">
                <img 
                  src={dog.profileImage} 
                  alt={`${dog.name}'s profile`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                  🐾
                </div>
              </div>
            ) : (
              <div className="mr-4 w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--phz-purple)] bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🐾</span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-[var(--phz-purple)]">{dog.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-[var(--phz-orange)] text-[var(--phz-orange)]' : 'text-gray-600'}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-[var(--phz-orange)] text-[var(--phz-orange)]' : 'text-gray-600'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[var(--phz-purple)] mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Breed</p>
                  <p className="font-medium">{dog.breed}</p>
                </div>
                <div>
                  <p className="text-gray-600">Animal Size</p>
                  <p className="font-medium">{dog.animalSize || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Hair Length</p>
                  <p className="font-medium">{dog.hairLength || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Hair Thickness</p>
                  <p className="font-medium">{dog.hairThickness || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Expected Grooming Time</p>
                  <p className="font-medium">{dog.expectedGroomingTime || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Training Session Balance</p>
                  <p className="font-medium">{typeof dog.trainingSessionBalance !== 'undefined' ? dog.trainingSessionBalance : 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Previously Boarded</p>
                  <p className="font-medium">{typeof dog.previouslyBoarded !== 'undefined' ? (dog.previouslyBoarded ? 'Yes' : 'No') : 'Not specified'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">{dog.lastUpdated.toLocaleString()} ({formatTimeElapsed(dog.lastUpdated)})</p>
                </div>
                <div>
                  <p className="text-gray-600">Most Recent Group Assignment</p>
                  <p className="font-medium">{getMostRecentLocation('group')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Most Recent Run Assignment</p>
                  <p className="font-medium">{getMostRecentLocation('run')}</p>
                </div>
                {dog.specialNotes && (
                  <div className="col-span-2">
                    <p className="text-gray-600">Special Notes</p>
                    <p className="font-medium">{dog.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[var(--phz-purple)] mb-2">Contact Information</h3>
              <div className="space-y-3">
                {/* Pet Owner Associations Section */}
                {isLoadingContacts ? (
                  <div className="text-gray-500">Loading associated contacts...</div>
                ) : ownerContacts.length > 0 ? (
                  <div>
                    <p className="text-gray-600 font-medium mt-2">Associated Contacts</p>
                    <ul className="space-y-2 mt-1">
                      {/* UPDATE: Iterate over ContactApiResponse[] */}
                      {ownerContacts.map((contactWrapper) => {
                        // Access the actual contact object via contactWrapper.contact
                        const contact = contactWrapper.contact; 
                        if (!contact) return null; // Skip rendering if contact data is missing
                        
                        const displayName = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.companyName || 'Unnamed Contact';
                        
                        return (
                          <li key={contact.id} className="border-l-2 border-[rgba(48,167,216,0.3)] pl-2">
                            {/* Make the name clickable */}
                            <button 
                              onClick={() => setSelectedContact(contact)} 
                              className="font-medium text-[var(--phz-blue)] hover:underline text-left w-full cursor-pointer"
                            >
                              {displayName}
                            </button>
                            {contact.email && (
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-sm text-gray-500">{contact.phone}</p>
                            )}
                            {/* Display address if available */}
                            {contact.address?.line1 && (
                              <p className="text-sm text-gray-500">
                                {contact.address.line1}
                                {contact.address.city && `, ${contact.address.city}`}
                                {contact.address.state && `, ${contact.address.state}`}
                                {contact.address.postalCode && ` ${contact.address.postalCode}`}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    {dog.owner 
                      ? "No additional associated contacts found" 
                      : "No owner information available - check GoHighLevel for contact details"}
                  </p>
                )}

                {/* Emergency Contact Info */}
                {(dog.emergencyContact || dog.emergencyPhone) && (
                  <div>
                    <p className="text-gray-600">Emergency Contact</p>
                    <p className="font-medium">{dog.emergencyContact || 'Name not specified'}</p>
                    {dog.emergencyPhone && <p className="text-sm text-gray-500">{dog.emergencyPhone}</p>}
                  </div>
                )}

                {/* Veterinarian Info */}
                {(dog.veterinarian || dog.vetPhone) && (
                  <div>
                    <p className="text-gray-600">Veterinarian</p>
                    <p className="font-medium">{dog.veterinarian || 'Name not specified'}</p>
                    {dog.vetPhone && <p className="text-sm text-gray-500">{dog.vetPhone}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Vaccination Status - Updated Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[var(--phz-purple)] mb-2">Vaccine Records</h3>
              {isLoadingVaccines ? (
                <div className="text-gray-500">Loading vaccine records...</div>
              ) : vaccineRecords.length > 0 ? (
                <div className="space-y-4">
                  {vaccineRecords.map((record) => {
                    return (
                      <div key={record.id} className="border p-3 rounded bg-white shadow-sm">
                        <p className="text-gray-600 text-sm">Type</p>
                        <p className="font-medium mb-2">{record.properties?.type || 'N/A'}</p>
                        
                        <p className="text-gray-600 text-sm">Status</p>
                        <p className="font-medium mb-2">{record.properties?.status || 'N/A'}</p>
                        
                        <p className="text-gray-600 text-sm">Vaccine Date</p>
                        <p className="font-medium mb-2">{formatDate(record.properties?.vaccine_date)}</p>
                        
                        <p className="text-gray-600 text-sm">Expiration Date</p>
                        <p className="font-medium">{formatDate(record.properties?.expiration_date)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No vaccine records found.</p>
              )}
            </div>

            {/* Notes - Removed since we now have Special Notes in Basic Info */}
            {dog.notes && !dog.specialNotes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-[var(--phz-purple)] mb-2">Additional Notes</h3>
                <p className="font-medium">{dog.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-[var(--phz-purple)] mb-2">Location History</h3>

            {dog.locationHistory.length === 0 ? (
              <p className="text-gray-500 italic">No location history recorded</p>
            ) : (
              <div className="space-y-2">
                {/* Timeline view */}
               <div className="border-l-2 border-[rgba(48,167,216,0.3)] pl-4 space-y-6">
                  {[...dog.locationHistory].reverse().map((entry, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                     <div className="absolute -left-6 w-2 h-2 rounded-full bg-[var(--phz-blue)]"></div>

                      {/* Content */}
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-600">{entry.timestamp.toLocaleString()}</p>
                        <p className="font-medium">
                          {entry.area ? `Moved to ${entry.area} (Position ${entry.position})` : 'Moved to Available Pool'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Conditionally render the ContactDetailsModal */}
      {selectedContact && (
        <ContactDetailsModal 
          contact={selectedContact} 
          onClose={() => setSelectedContact(null)} 
        />
      )}
    </div>
  );
}; 
