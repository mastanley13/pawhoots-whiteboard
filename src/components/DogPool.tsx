import React from 'react';
import { Dog } from '../types/types';
import { DogCard } from './DogCard';

interface DogPoolProps {
  poolDogs: Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: null, position: number) => void; // Area is always null for pool
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
}

export const DogPool: React.FC<DogPoolProps> = ({ 
  poolDogs, 
  handleDragOver, 
  handleDrop, 
  handleDragStart,
  setSelectedDog
}) => {
  return (
    <div
      className="bg-white shadow-sm rounded-xl p-4 border border-gray-200"
      onDragOver={handleDragOver}
      onDrop={e => handleDrop(e, null, 0)} // Position doesn't matter for pool
    >
      <h2 className="text-xl font-bold text-[#005596] mb-4 flex items-center">
        <span className="mr-2">🐶</span>
        Available Pool <span className="ml-2 text-sm font-normal text-gray-600">({poolDogs.length} dogs)</span>
      </h2>

      {poolDogs.length === 0 ? (
        <div className="text-center text-gray-500 italic py-8 border-2 border-dashed border-gray-300 rounded-lg">
          No dogs currently available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {poolDogs.map(dog => (
            <DogCard 
              key={dog.id} 
              dog={dog} 
              onDragStart={handleDragStart}
              onViewDetails={setSelectedDog}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 