import React from 'react';
import { Dog, LocationArea } from '../types/types';
import { DropZone } from './DropZone';

interface AreaSectionProps {
  area: LocationArea;
  title: string;
  positions: number;
  dogs: Dog[];
  getDogsInPosition: (area: LocationArea, position: number) => Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: LocationArea, position: number) => void;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
}

export const AreaSection: React.FC<AreaSectionProps> = ({ 
  area, 
  title, 
  positions, 
  dogs, 
  getDogsInPosition, 
  handleDragOver, 
  handleDrop,
  handleDragStart,
  setSelectedDog
}) => {
  const dogsInAreaCount = dogs.filter(dog => dog.location.area === area).length;
  const capacityColor = dogsInAreaCount >= positions ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

  return (
    <div className="col-span-1">
      <div className="bg-gray-100 p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${capacityColor}`}>
          {dogsInAreaCount}/{positions}
        </span>
      </div>
      <div className="border-2 border-gray-300 rounded-b-lg">
        <div className="space-y-4 p-2"> {/* Add some padding around dropzones */}
          {Array.from({ length: positions }, (_, i) => (
            <DropZone 
              key={`${area}-${i + 1}`}
              area={area} 
              position={i + 1} 
              dogsInPosition={getDogsInPosition(area, i + 1)}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              setSelectedDog={setSelectedDog}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 