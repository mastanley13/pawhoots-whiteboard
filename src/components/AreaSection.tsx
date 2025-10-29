import React, { useMemo } from "react";
import { Dog, LocationArea } from "../types/types";
import { DropZone } from "./DropZone";

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

const headerStyles: Record<string, { background: string; color: string }> = {
  small: { background: "linear-gradient(135deg, #ede8ff 0%, #dcd2ff 100%)", color: "#372879" },
  medium: { background: "linear-gradient(135deg, #e0f6ff 0%, #bfe9f7 100%)", color: "#124c63" },
  large: { background: "linear-gradient(135deg, #ffe9d6 0%, #ffd2b1 100%)", color: "#7a2d09" },
  buddy_play: { background: "linear-gradient(135deg, #ffe4f1 0%, #ffd6e8 100%)", color: "#6b2245" },
  play_school: { background: "linear-gradient(135deg, #e7f5ff 0%, #cde9ff 100%)", color: "#1f3a85" },
  default: { background: "linear-gradient(135deg, #ede8ff 0%, #ffe9da 100%)", color: "#372879" },
};

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
  handleMobileDrop,
}) => {
  const dogsInAreaCount = dogs.filter((dog) => dog.location.area === area).length;
  const capacityBadgeClasses =
    dogsInAreaCount >= positions ? "bg-red-100/80 text-red-700" : "bg-green-100/80 text-green-700";
  const styleKey = typeof area === "string" ? area : "default";
  const headerStyle = headerStyles[styleKey] ?? headerStyles.default;

  const visibleSlots = useMemo(() => {
    const needed = Math.max(dogsInAreaCount + 1, 1);
    return Math.min(positions, needed);
  }, [dogsInAreaCount, positions]);

  return (
    <div className="col-span-1 rounded-xl overflow-hidden shadow-md border border-gray-200/50 bg-white">
      <div
        className="p-3 md:p-4 flex justify-between items-center"
        style={{ background: headerStyle.background, color: headerStyle.color }}
      >
        <h3 className="text-lg font-semibold uppercase tracking-wide">{title}</h3>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-white/60 ${capacityBadgeClasses}`}>
          {dogsInAreaCount}/{positions}
        </span>
      </div>
      <div className="bg-white/90">
        <div className="space-y-3 md:space-y-4 p-3">
          {Array.from({ length: visibleSlots }, (_, index) => (
            <DropZone
              key={`${area}-${index + 1}`}
              area={area}
              position={index + 1}
              dogsInPosition={getDogsInPosition(area, index + 1)}
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
