import React from 'react';
import { Dog } from '../types/types';
import { DogCard } from './DogCard';

interface DogPoolProps {
  poolDogs: Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: null, position: number) => void; // Area is always null for pool
  // Props needed by DogCard
  getStaffById: (staffId: string | null) => any;
  showAlerts: boolean;
  longStayThresholdMs: number;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
}

export const DogPool: React.FC<DogPoolProps> = ({ 
  poolDogs, 
  handleDragOver, 
  handleDrop, 
  // DogCard props
  getStaffById,
  showAlerts,
  longStayThresholdMs,
  handleDragStart,
  setSelectedDog
}) => {
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-lg mb-8" // Added mb-8 for spacing
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, null, 0)} // Position is irrelevant for the pool
    >
      <h2 className="text-2xl font-bold text-[#005596] mb-4">Dog Pool (Available)</h2>
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
              getStaffById={getStaffById}
              showAlerts={showAlerts}
              longStayThresholdMs={longStayThresholdMs}
              onDragStart={handleDragStart}
              onViewDetails={setSelectedDog}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 