import React from 'react';
import { Dog } from '../types/types';

// Helper function for formatting time elapsed
export const formatTimeElapsed = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day ago`;
};

// Format date for display
export const formatDate = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Check if dog has been in location too long
export const hasLongStay = (dog: Dog, longStayThresholdMs: number): boolean => {
  if (!dog.location.area) return false; // Skip dogs in the pool
  const stayDuration = new Date().getTime() - dog.lastUpdated.getTime();
  return stayDuration > longStayThresholdMs;
};

// Get the appropriate style class based on dog color
export const getDogCardStyle = (color: string | null | undefined): string => {
  switch (color) {
    case 'green':
      return 'bg-green-100 border-green-500';
    case 'yellow':
      return 'bg-yellow-100 border-yellow-500';
    case 'orange':
      return 'bg-orange-100 border-orange-500';
    case 'blue':
      return 'bg-blue-100 border-blue-500';
    case 'red':
      return 'bg-red-100 border-red-500';
    default:
      return 'bg-gray-100 border-gray-500';
  }
};

// Get the icon for a specific trait
export const getTraitIcon = (trait: string): JSX.Element | null => {
  switch (trait) {
    case 'jumper':
      return (
        <div className="bg-yellow-100 p-1 rounded-full" title="Jumper - May jump when excited">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      );
    case 'vocal':
      return (
        <div className="bg-blue-100 p-1 rounded-full" title="Vocal - Barks frequently">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 18.364a9 9 0 010-12.728M18.364 5.636a9 9 0 010 12.728" />
          </svg>
        </div>
      );
    case 'protective':
      return (
        <div className="bg-purple-100 p-1 rounded-full" title="Protective - May be territorial">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      );
    case 'food-motivated':
      return (
        <div className="bg-orange-100 p-1 rounded-full" title="Food Motivated">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'energetic':
      return (
        <div className="bg-red-100 p-1 rounded-full" title="High Energy">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case 'gentle':
      return (
        <div className="bg-green-100 p-1 rounded-full" title="Gentle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}; 