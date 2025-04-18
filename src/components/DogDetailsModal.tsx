import React, { useState } from 'react';
import { Dog, Staff, LocationArea } from '../types/types';
import { formatTimeElapsed } from "../utils";
import { ScheduleMoveModal } from './ScheduleMoveModal';

interface DogDetailsModalProps {
  dog: Dog;
  staff: Staff[];
  getStaffById: (staffId: string | null) => Staff | null;
  assignStaffToDog: (dogId: string, staffId: string | null) => void;
  scheduleMove: (dogId: string, targetArea: LocationArea, targetPosition: number | null, scheduledTime: Date) => void;
  deleteScheduledMove: (dogId: string, moveId: string) => void;
  onClose: () => void;
}

export const DogDetailsModal: React.FC<DogDetailsModalProps> = ({ 
  dog, 
  staff,
  getStaffById,
  assignStaffToDog,
  scheduleMove,
  deleteScheduledMove,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'schedule'>('info');
  const [showScheduleMove, setShowScheduleMove] = useState(false);
  const assignedStaffMember = getStaffById(dog.assignedStaff);

  const handleScheduleMove = (
    targetArea: LocationArea,
    targetPosition: number | null,
    scheduledTime: Date
  ) => {
    scheduleMove(dog.id, targetArea, targetPosition, scheduledTime);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#005596]">{dog.name}</h2>
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
                  <p className="text-gray-600">Status</p>
                  <p className="font-medium capitalize">{dog.location.area || 'Available'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium">{dog.lastUpdated.toLocaleString()} ({formatTimeElapsed(dog.lastUpdated)})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Assigned Staff</p>
                  {assignedStaffMember ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{assignedStaffMember.avatar}</span>
                      <div>
                        <p className="font-medium">{assignedStaffMember.name}</p>
                        <p className="text-xs text-gray-500">{assignedStaffMember.position}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-500">Not assigned</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <select
                  className="p-2 border border-gray-300 rounded-lg flex-1"
                  value={dog.assignedStaff || ''}
                  onChange={e => assignStaffToDog(dog.id, e.target.value || null)}
                >
                  <option value="">Not Assigned</option>
                  {staff.map(staffMember => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.avatar} {staffMember.name} ({staffMember.position})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">Owner</p>
                  <p className="font-medium">{dog.owner}</p>
                  <p className="text-sm text-gray-500">{dog.ownerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Emergency Contact</p>
                  <p className="font-medium">{dog.emergencyContact}</p>
                  <p className="text-sm text-gray-500">{dog.emergencyPhone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Veterinarian</p>
                  <p className="font-medium">{dog.veterinarian}</p>
                  <p className="text-sm text-gray-500">{dog.vetPhone}</p>
                </div>
              </div>
            </div>

            {/* Medical & Care */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Medical & Care Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600">Medications</p>
                  {dog.medications && dog.medications.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {dog.medications.map((med, index) => (
                        <li key={index} className="font-medium">{med}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-medium">No medications</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-600">Feeding Schedule</p>
                  <p className="font-medium">{dog.feedingSchedule}</p>
                </div>
              </div>
            </div>

            {/* Behavioral Traits */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Behavioral Traits</h3>
              <div className="flex flex-wrap gap-2">
                {dog.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-[#005596] mb-2">Additional Notes</h3>
              <p className="font-medium">{dog.notes || 'No additional notes'}</p>
            </div>
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