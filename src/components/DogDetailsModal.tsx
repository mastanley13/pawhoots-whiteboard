import React, { useState, useEffect } from 'react';
import { Dog, Staff, LocationArea } from '../types/types';
import { formatTimeElapsed } from "../utils";
import { ScheduleMoveModal } from './ScheduleMoveModal';
import { getPetOwnerContactDetails } from '../services/api';

interface DogDetailsModalProps {
  dog: Dog;
  getStaffById: (staffId: string | null) => Staff | null;
  scheduleMove: (dogId: string, targetArea: LocationArea, targetPosition: number | null, scheduledTime: Date) => void;
  deleteScheduledMove: (dogId: string, moveId: string) => void;
  onClose: () => void;
}

// Interface for owner contact details
interface OwnerContact {
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

export const DogDetailsModal: React.FC<DogDetailsModalProps> = ({ 
  dog, 
  getStaffById,
  scheduleMove,
  deleteScheduledMove,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'schedule'>('info');
  const [showScheduleMove, setShowScheduleMove] = useState(false);
  const [ownerContacts, setOwnerContacts] = useState<OwnerContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Get the most recent yard and run assignments from location history
  const getMostRecentLocation = (locationType: 'yard' | 'run'): string => {
    if (!dog.locationHistory || dog.locationHistory.length === 0) {
      return 'None';
    }
    
    // Filter for yard or run locations and sort by timestamp (newest first)
    const filteredHistory = [...dog.locationHistory]
      .filter(entry => 
        locationType === 'yard' 
          ? entry.area === 'yard1' || entry.area === 'yard2'
          : entry.area === 'runs' || entry.area === 'chucksAlley' || entry.area === 'nalasDen' || entry.area === 'trinsTown'
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Return the area name if found, otherwise 'None'
    return filteredHistory.length > 0 
      ? (filteredHistory[0].area || 'None')
      : 'None';
  };

  const handleScheduleMove = (
    targetArea: LocationArea,
    targetPosition: number | null,
    scheduledTime: Date
  ) => {
    scheduleMove(dog.id, targetArea, targetPosition, scheduledTime);
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
        setOwnerContacts(contacts);
      } catch (error) {
        console.error('Error fetching owner contacts:', error);
        setOwnerContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    
    fetchOwnerContacts();
  }, [dog.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {/* Pet Profile Image */}
            {dog.profileImage ? (
              <div className="mr-4 w-16 h-16 rounded-full overflow-hidden border-2 border-[#005596]">
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
              <div className="mr-4 w-16 h-16 rounded-full overflow-hidden border-2 border-[#005596] bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">🐾</span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-[#005596]">{dog.name}</h2>
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
            className={`px-4 py-2 ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('info')}
          >
            Info
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'schedule' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Basic Information</h3>
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
                  <p className="text-gray-600">Most Recent Yard Assignment</p>
                  <p className="font-medium">{getMostRecentLocation('yard')}</p>
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
              <h3 className="font-bold text-[#005596] mb-2">Contact Information</h3>
              <div className="space-y-3">
                {/* Primary Owner Information */}
                <div>
                  <p className="text-gray-600">Primary Owner</p>
                  <p className="font-medium">{dog.owner || 'Unknown'}</p>
                  {dog.ownerPhone && <p className="text-sm text-gray-500">{dog.ownerPhone}</p>}
                </div>

                {/* Pet Owner Associations Section */}
                {isLoadingContacts ? (
                  <div className="text-gray-500">Loading associated contacts...</div>
                ) : ownerContacts.length > 0 ? (
                  <div>
                    <p className="text-gray-600 font-medium mt-2">Associated Contacts</p>
                    <ul className="space-y-2 mt-1">
                      {ownerContacts.map((contact) => (
                        <li key={contact.id} className="border-l-2 border-blue-300 pl-2">
                          <p className="font-medium">
                            {contact.name || 
                              `${contact.firstName || ''} ${contact.lastName || ''}`.trim() ||
                              contact.companyName || 
                              'Unnamed Contact'}
                          </p>
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
                      ))}
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

            {/* Vaccination Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Vaccination Status</h3>
              <div className="space-y-3">
                {/* Rabies Vaccination */}
                <div>
                  <p className="text-gray-600">Rabies</p>
                  <p className="font-medium">
                    {dog.rabiesVaccination ? 
                      `Vaccinated (Expires: ${new Date(dog.rabiesVaccination).toLocaleDateString()})` : 
                      'Not on file'}
                  </p>
                </div>

                {/* DHPP Vaccination */}
                <div>
                  <p className="text-gray-600">DHPP</p>
                  <p className="font-medium">
                    {dog.dhppVaccination ? 
                      `Vaccinated (Expires: ${new Date(dog.dhppVaccination).toLocaleDateString()})` : 
                      'Not on file'}
                  </p>
                </div>

                {/* Bordetella Vaccination */}
                <div>
                  <p className="text-gray-600">Bordetella</p>
                  <p className="font-medium">
                    {dog.bordetellaVaccination ? 
                      `Vaccinated (Expires: ${new Date(dog.bordetellaVaccination).toLocaleDateString()})` : 
                      'Not on file'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes - Removed since we now have Special Notes in Basic Info */}
            {dog.notes && !dog.specialNotes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-[#005596] mb-2">Additional Notes</h3>
                <p className="font-medium">{dog.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-[#005596] mb-2">Location History</h3>

            {dog.locationHistory.length === 0 ? (
              <p className="text-gray-500 italic">No location history recorded</p>
            ) : (
              <div className="space-y-2">
                {/* Timeline view */}
                <div className="border-l-2 border-blue-300 pl-4 space-y-6">
                  {[...dog.locationHistory].reverse().map((entry, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-6 w-2 h-2 rounded-full bg-blue-500"></div>

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

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#005596]">Scheduled Moves</h3>
              <button
                onClick={() => setShowScheduleMove(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
              >
                + New Schedule
              </button>
            </div>

            {dog.scheduledMoves.length === 0 ? (
              <p className="text-gray-500 italic">No scheduled moves</p>
            ) : (
              <div className="space-y-3">
                {dog.scheduledMoves
                  .filter(move => !move.completed)
                  .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
                  .map((move, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {move.targetArea ? `Move to ${move.targetArea} (Position ${move.targetPosition})` : 'Move to Available Pool'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Scheduled for: {move.scheduledTime.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteScheduledMove(dog.id, move.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <h4 className="font-semibold text-[#005596] mt-6">Completed Moves</h4>
                  {dog.scheduledMoves.filter(move => move.completed).length === 0 ? (
                    <p className="text-gray-500 italic">No completed moves</p>
                  ) : (
                    dog.scheduledMoves
                      .filter(move => move.completed)
                      .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
                      .map((move, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg opacity-70">
                          <p className="font-medium">
                            {move.targetArea ? `Moved to ${move.targetArea} (Position ${move.targetPosition})` : 'Moved to Available Pool'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed: {move.scheduledTime.toLocaleString()}
                          </p>
                        </div>
                      ))
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {showScheduleMove && (
        <ScheduleMoveModal
          dog={dog}
          onClose={() => setShowScheduleMove(false)}
          onSchedule={handleScheduleMove}
        />
      )}
    </div>
  );
}; 