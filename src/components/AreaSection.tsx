import React, { useState } from 'react';
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
  mobileMoveDogId?: string | null;
  setMobileMoveDogId?: (id: string | null) => void;
  handleMobileDrop?: (area: LocationArea, position: number | null) => void;
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
  setSelectedDog,
  mobileMoveDogId,
  setMobileMoveDogId,
  handleMobileDrop
}) => {
  const dogsInAreaCount = dogs.filter(dog => dog.location.area === area).length;
  const capacityColor = dogsInAreaCount >= positions ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

  // Collapse logic: collapsed by default on all viewports; user can expand.
  const isDefaultCollapsed = true;
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isDefaultCollapsed);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  return (
    <div className="col-span-1">
      <div
        className="bg-gray-100 p-3 md:p-4 rounded-t-lg flex justify-between items-center cursor-pointer select-none"
        onClick={toggleCollapse}
        onDragOver={(e) => {
          // If collapsed, expand to allow dropping inside
          if (isCollapsed) {
            e.preventDefault();
            setIsCollapsed(false);
          }
        }}
      >
        <h3 className="text-lg font-bold flex items-center gap-2">
          {/* Collapse / Expand chevron – visible only on mobile */}
          <span className="inline-block transform transition-transform duration-200"
            style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            ▼
          </span>
          {title}
        </h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${capacityColor}`}>
          {dogsInAreaCount}/{positions}
        </span>
      </div>
      {/* Content: hide when collapsed */}
      <div className={`border-2 border-gray-300 rounded-b-lg ${isCollapsed ? 'hidden' : ''}`}>
        <div className="space-y-3 md:space-y-4 p-2">
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
              mobileMoveDogId={mobileMoveDogId}
              setMobileMoveDogId={setMobileMoveDogId}
              handleMobileDrop={handleMobileDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 