import React from 'react';
import { Dog } from '../types/types';
import { getDogCardStyle, formatDate } from '../utils';

interface DogCardProps {
  dog: Dog;
  onDragStart: (e: React.DragEvent, dogId: string) => void;
  onViewDetails: (dog: Dog) => void;
  // Mobile move support
  onMobileSelect?: (dogId: string) => void;
  isSelectedForMove?: boolean;
}

export const DogCard: React.FC<DogCardProps> = ({
  dog,
  onDragStart,
  onViewDetails,
  onMobileSelect,
  isSelectedForMove
}) => {
  const hasPendingMoves = dog.scheduledMoves.filter(move => !move.completed).length > 0;

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = ''; // Clear the src to prevent further error attempts
    e.currentTarget.classList.add('hidden'); // Hide the image
    e.currentTarget.nextElementSibling?.classList.remove('hidden'); // Show the fallback emoji
  };

  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  const handleClick = () => {
    if (isTouchDevice && onMobileSelect) {
      onMobileSelect(dog.id);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, dog.id)}
      onClick={handleClick}
      className={`w-full ${getDogCardStyle(dog.color)} p-3 md:p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-${isTouchDevice ? 'pointer' : 'move'} relative flex flex-col ${isSelectedForMove ? 'ring-2 ring-blue-500' : ''}`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(dog);
        }}
        className="absolute top-2 right-2 hover:bg-blue-100 text-blue-600 p-1 rounded-full flex items-center justify-center w-6 h-6 z-10"
        title="View Details"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {/* Name and Breed with Profile Image */}
      <div className="flex items-center">
        <div className="mr-2 flex-shrink-0 w-8 h-8 md:w-10 md:h-10 overflow-hidden relative">
          {dog.profileImage ? (
            <>
              <img 
                src={dog.profileImage} 
                alt={`${dog.name}'s profile`}
                className="rounded-full w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="hidden text-2xl">🐾</div>
            </>
          ) : (
            <div className="text-2xl flex items-center justify-center h-full">🐾</div>
          )}
        </div>
        <div>
          <h3 className="text-blue-900 font-semibold text-sm md:text-base">{dog.name}</h3>
          <p className="text-gray-600 text-xs md:text-sm">{dog.breed}</p>
        </div>
      </div>
      
      {/* Scheduled Moves Indicator (optional) */}
      {hasPendingMoves && (
        <div className="mt-2 text-[10px] md:text-xs bg-purple-50 text-purple-700 px-2 py-0.5 md:px-2 md:py-1 rounded w-fit ml-auto">
          <span className="mr-1">🗓</span>
          <span>
            {formatDate(dog.scheduledMoves.filter(move => !move.completed)[0].scheduledTime)}
          </span>
        </div>
      )}
    </div>
  );
}; 