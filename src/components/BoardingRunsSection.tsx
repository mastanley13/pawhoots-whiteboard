import React from 'react';
import { Dog } from '../types/types';
import { AreaSection } from './AreaSection'; // Use AreaSection to render each run

interface BoardingRunsSectionProps {
  dogs: Dog[];
  getDogsInPosition: (area: any, position: number) => Dog[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, area: any, position: number) => void;
  handleDragStart: (e: React.DragEvent, dogId: string) => void;
  setSelectedDog: (dog: Dog | null) => void;
}

export const BoardingRunsSection: React.FC<BoardingRunsSectionProps> = (props) => {
  const runAreas = [
    { area: 'runs', title: "Runs", positions: 8 },
    { area: 'chucksAlley', title: "Chuck's Alley", positions: 8 },
    { area: 'nalasDen', title: "Nala's Den", positions: 8 },
    { area: 'trinsTown', title: "Trin's Town", positions: 8 },
  ] as const; // Use 'as const' for better type inference on area names

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-[#005596] mb-6">Boarding Runs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {runAreas.map(run => (
          <AreaSection
            key={run.area}
            area={run.area}
            title={run.title}
            positions={run.positions}
            dogs={props.dogs}
            getDogsInPosition={props.getDogsInPosition}
            handleDragOver={props.handleDragOver}
            handleDrop={props.handleDrop}
            handleDragStart={props.handleDragStart}
            setSelectedDog={props.setSelectedDog}
          />
        ))}
      </div>
    </div>
  );
}; 