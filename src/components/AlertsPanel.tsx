import React from 'react';
import { Dog } from '../types/types';
import { formatTimeElapsed } from '../utils';

interface AlertsPanelProps {
  dogs: Dog[];
  showAlerts: boolean;
  setSelectedDog: (dog: Dog | null) => void;
  longStayThresholdMs: number;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ 
  dogs, 
  showAlerts, 
  setSelectedDog,
  longStayThresholdMs 
}) => {
  // Calculate stay alerts directly within the component
  const stayAlerts = dogs.filter(dog => {
    if (!dog.location.area) return false; // Skip dogs in the pool
    const stayDuration = new Date().getTime() - dog.lastUpdated.getTime();
    return stayDuration > longStayThresholdMs;
  });

  if (!showAlerts || stayAlerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>Long Stay Alerts</span>
        </h3>
        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {stayAlerts.length} {stayAlerts.length === 1 ? 'Alert' : 'Alerts'}
        </span>
      </div>

      <div className="space-y-3">
        {stayAlerts.map(dog => (
          <div key={dog.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🐕</div>
              <div>
                <h4 className="font-medium text-gray-900">{dog.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                  {/* Calculate formatted time elapsed here */}
                  <span>In {dog.location.area} for {formatTimeElapsed(dog.lastUpdated)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDog(dog)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 