import React from "react";
import { Dog, LocationArea } from "../types/types";
import { DogCard } from "./DogCard";

interface DropZoneProps {
  area: LocationArea;
  position: number;
  dogsInPosition: Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: LocationArea, position: number) => void;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
  mobileMoveDogId?: string | null;
  setMobileMoveDogId?: (id: string | null) => void;
  handleMobileDrop?: (area: LocationArea, position: number | null) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  area,
  position,
  dogsInPosition,
  handleDragOver,
  handleDrop,
  handleDragStart,
  setSelectedDog,
  mobileMoveDogId,
  setMobileMoveDogId,
  handleMobileDrop,
}) => {
  const isEmpty = dogsInPosition.length === 0;
  const baseClasses = isEmpty
    ? "bg-white/75 border border-dashed border-[#7d48c2]/30"
    : "bg-white shadow-sm border border-[#f0f0f0]";

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, area, position)}
      onClick={() => {
        if (mobileMoveDogId && handleMobileDrop) {
          handleMobileDrop(area, position);
        }
      }}
      className={`min-h-[80px] md:min-h-[100px] rounded-lg transition-all duration-150 ${baseClasses} ${mobileMoveDogId ? 'cursor-pointer' : ''}`}
    >
      {dogsInPosition.map((dog) => (
        <DogCard
          key={dog.id}
          dog={dog}
          onDragStart={handleDragStart}
          onViewDetails={setSelectedDog}
          onMobileSelect={setMobileMoveDogId}
          isSelectedForMove={mobileMoveDogId === dog.id}
        />
      ))}
    </div>
  );
};
