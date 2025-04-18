import React from 'react';
import { Dog, Staff } from '../types/types';
import { getDogCardStyle, getTraitIcon, formatTimeElapsed, formatDate, hasLongStay } from '../utils';

interface DogCardProps {
  dog: Dog;
  getStaffById: (staffId: string | null) => Staff | null;
  showAlerts: boolean;
  longStayThresholdMs: number;
  onDragStart: (e: React.DragEvent, dogId: string) => void;
  onViewDetails: (dog: Dog) => void;
}

export const DogCard: React.FC<DogCardProps> = ({
  dog,
  getStaffById,
  showAlerts,
  longStayThresholdMs,
  onDragStart,
  onViewDetails
}) => {
  const assignedStaffMember = getStaffById(dog.assignedStaff);
  const isOverdue = hasLongStay(dog, longStayThresholdMs);
  const hasPendingMoves = dog.scheduledMoves.filter(move => !move.completed).length > 0;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, dog.id)}
      className={`${getDogCardStyle(dog.color)} p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move relative flex flex-col ${isOverdue && showAlerts ? 'border-2 border-red-500 animate-pulse' : ''}`}
    >
      <button
        onClick={() => onViewDetails(dog)}
        className="absolute top-2 right-2 hover:bg-blue-100 text-blue-600 p-1 rounded-full flex items-center justify-center w-6 h-6 z-10"
        title="View Details"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">🐾</span>
        <div className="flex-1">
          <h3 className="text-blue-900 font-semibold flex items-center gap-1">
            {dog.name}
            {hasPendingMoves && (
              <span title="Has scheduled moves" className="text-xs bg-blue-100 text-blue-800 px-1 rounded-full">🗓</span>
            )}
          </h3>
          <p className="text-gray-600 text-sm">{dog.breed}</p>
          <p className="text-xs text-gray-500 italic">
            {dog.location.area ? `Updated: ${formatTimeElapsed(dog.lastUpdated)}` : ''}
            {isOverdue && showAlerts && (
              <span className="text-red-500 font-semibold ml-1">! LONG STAY</span>
            )}
          </p>
        </div>
      </div>
      
      {assignedStaffMember && (
        <div className="flex items-center mt-1 mb-2">
          <span className="text-xs text-gray-600 flex items-center">
            <span className="mr-1">{assignedStaffMember.avatar}</span>
            <span>Staff: {assignedStaffMember.name}</span>
          </span>
        </div>
      )}
      
      <div className="flex flex-wrap gap-1">
        {dog.traits.map((trait, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100"
          >
            {getTraitIcon(trait)} {trait}
          </span>
        ))}
      </div>
      
      <div className="flex mt-2 pt-2 border-t border-gray-200 justify-end">
        {dog.scheduledMoves.filter(move => !move.completed).length > 0 && (
          <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center">
            <span className="mr-1">🗓</span>
            <span>
              {formatDate(dog.scheduledMoves.filter(move => !move.completed)[0].scheduledTime)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 