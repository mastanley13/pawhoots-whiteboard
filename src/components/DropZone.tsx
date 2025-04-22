import React from 'react';
import { Dog, LocationArea } from '../types/types';
import { DogCard } from './DogCard';

interface DropZoneProps {
  area: LocationArea;
  position: number;
  dogsInPosition: Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: LocationArea, position: number) => void;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  area, 
  position, 
  dogsInPosition, 
  handleDragOver, 
  handleDrop, 
  handleDragStart,
  setSelectedDog
}) => {
  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, area, position)}
      className={`min-h-[100px] rounded-lg ${dogsInPosition.length === 0 ? 'border-2 border-dashed border-gray-300' : ''}`}
    >
      {dogsInPosition.map(dog => (
        <DogCard 
          key={dog.id} 
          dog={dog} 
          onDragStart={handleDragStart}
          onViewDetails={setSelectedDog}
        />
      ))}
    </div>
  );
}; 