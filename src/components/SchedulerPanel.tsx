import React from 'react';
import { Dog } from '../types/types';
import { formatDate } from '../utils';

interface SchedulerPanelProps {
  dogs: Dog[];
  showScheduler: boolean;
  setSelectedDog: (dog: Dog | null) => void;
  deleteScheduledMove: (dogId: string, moveId: string) => void;
}

export const SchedulerPanel: React.FC<SchedulerPanelProps> = ({ 
  dogs, 
  showScheduler,
  setSelectedDog, 
  deleteScheduledMove
}) => {
  // Get all pending scheduled moves
  const allScheduledMoves = dogs.flatMap(dog => 
    dog.scheduledMoves
      .filter(move => !move.completed)
      .map(move => ({ dog, move }))
  ).sort((a, b) => a.move.scheduledTime.getTime() - b.move.scheduledTime.getTime());

  if (!showScheduler || allScheduledMoves.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-[rgba(48,167,216,0.12)] border border-[rgba(48,167,216,0.3)] rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[var(--phz-blue)] flex items-center gap-2">
          <span>⏰</span>
          <span>Upcoming Scheduled Moves</span>
        </h3>
        <span className="bg-[rgba(48,167,216,0.2)] text-[var(--phz-blue)] text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {allScheduledMoves.length} {allScheduledMoves.length === 1 ? 'Move' : 'Moves'}
        </span>
      </div>

      <div className="space-y-3">
        {allScheduledMoves.slice(0, 5).map(({ dog, move }) => (
          <div key={`${dog.id}-${move.id}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🐕</div>
              <div>
                <h4 className="font-medium text-gray-900">{dog.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <span>{move.targetArea ? `Move to ${move.targetArea}` : 'Move to Available Pool'} at {formatDate(move.scheduledTime)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDog(dog)}
                className="px-3 py-1 bg-[rgba(48,167,216,0.2)] text-[var(--phz-blue)] rounded text-sm"
              >
                View
              </button>
              <button 
                onClick={() => deleteScheduledMove(dog.id, move.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}

        {allScheduledMoves.length > 5 && (
          <div className="text-center text-sm text-[var(--phz-blue)]">
            + {allScheduledMoves.length - 5} more scheduled moves
          </div>
        )}
      </div>
    </div>
  );
}; 
