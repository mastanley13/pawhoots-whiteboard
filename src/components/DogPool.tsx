import React from "react";
import { Dog } from "../types/types";
import { DogCard } from "./DogCard";

interface DogPoolProps {
  poolDogs: Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: null, position: number) => void;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
  mobileMoveDogId?: string | null;
  setMobileMoveDogId?: (id: string | null) => void;
  handleMobileDrop?: (area: null, position: number | null) => void;
}

const poolGradient = "var(--phz-gradient-header)";

export const DogPool: React.FC<DogPoolProps> = ({
  poolDogs,
  handleDragOver,
  handleDrop,
  handleDragStart,
  setSelectedDog,
  mobileMoveDogId,
  setMobileMoveDogId,
  handleMobileDrop,
}) => {
  return (
    <div
      className="rounded-xl border border-gray-200 shadow-md overflow-hidden"
      style={{ background: poolGradient }}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, null, 0)}
      onClick={() => {
        if (mobileMoveDogId && handleMobileDrop) {
          handleMobileDrop(null, 0);
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          <span role="img" aria-label="dog face" className="text-lg">
            {"\u{1F436}"}
          </span>
          Available Pool
        </h2>
        <span className="text-sm font-semibold bg-white/80 px-2 py-1 rounded-full text-[var(--phz-purple)]">
          {poolDogs.length} dogs
        </span>
      </div>
      <div className="bg-white/85 px-4 pb-4 pt-2">
        {poolDogs.length === 0 ? (
          <div className="text-center text-gray-500 italic py-8 border-2 border-dashed border-[#7d48c2]/30 rounded-lg">
            No dogs currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {poolDogs.map((dog) => (
              <DogCard
                key={dog.id}
                dog={dog}
                onDragStart={handleDragStart}
                onViewDetails={setSelectedDog}
                onMobileSelect={setMobileMoveDogId ? (id) => setMobileMoveDogId(id) : undefined}
                isSelectedForMove={mobileMoveDogId === dog.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

