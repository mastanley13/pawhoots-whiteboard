import React, { useState } from 'react';
import { Dog, LocationArea } from '../types/types';

interface ScheduleMoveModalProps {
  dog: Dog;
  onClose: () => void;
  onSchedule: (targetArea: LocationArea, targetPosition: number | null, scheduledTime: Date) => void;
}

export const ScheduleMoveModal: React.FC<ScheduleMoveModalProps> = ({ dog, onClose, onSchedule }) => {
  const [targetArea, setTargetArea] = useState<LocationArea>(dog.location.area);
  const [targetPosition, setTargetPosition] = useState<number | null>(1);
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('0');

  const handleSchedule = () => {
    const now = new Date();
    const scheduledTime = new Date(
      now.getTime() + (parseInt(hours) * 60 * 60 * 1000) + (parseInt(minutes) * 60 * 1000)
    );

    onSchedule(targetArea, targetArea ? targetPosition : null, scheduledTime); // Position is null if area is null (pool)
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--phz-purple)]">Schedule Move for {dog.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="target-area">
              Target Group
            </label>
            <select
              id="target-area"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={targetArea || ''}
              onChange={e => setTargetArea(e.target.value as LocationArea)}
            >
              <option value="">Available (Pool)</option>
              <option value="small">Small Group</option>
              <option value="medium">Medium Group</option>
              <option value="large">Large Group</option>
              <option value="buddy_play">Buddy Play</option>
              <option value="play_school">Play School</option>
              <option value="lobby">Lobby</option>
              <option value="smallDogSuite">Small Dog Suite</option>
              <option value="training">Training</option>
              <option value="runs">Runs</option>
              <option value="chucksAlley">Chuck's Alley</option>
              <option value="nalasDen">Nala's Den</option>
              <option value="trinsTown">Trin's Town</option>
            </select>
          </div>

          {targetArea && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="target-position">
                Position
              </label>
              <input
                id="target-position"
                type="number"
                min="1"
                max="12" // Consider making this dynamic based on area capacity?
                className="w-full p-2 border border-gray-300 rounded-lg"
                value={targetPosition || 1}
                onChange={e => setTargetPosition(parseInt(e.target.value))}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Time (from now)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="hours">
                  Hours
                </label>
                <input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="minutes">
                  Minutes
                </label>
                <input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={minutes}
                  onChange={e => setMinutes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="px-4 py-2 bg-[var(--phz-orange)] hover:bg-[#d63f1c] text-white rounded-lg transition-colors"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
