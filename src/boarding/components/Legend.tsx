import React from 'react';

export const Legend: React.FC = () => (
  <div className="text-xs text-gray-700">
    <span className="mr-4">Arrivals •</span>
    <span className="mr-4">Departures |</span>
    <span className="mr-6">Status: 
      <span className="ml-2 rounded-full border border-green-300 bg-green-100 px-2 py-[1px] text-[10px] text-green-700">In</span>
      <span className="ml-2 rounded-full border border-gray-300 bg-gray-100 px-2 py-[1px] text-[10px] text-gray-700">Expected</span>
      <span className="ml-2 rounded-full border border-purple-300 bg-purple-100 px-2 py-[1px] text-[10px] text-purple-700">Out</span>
    </span>
    <span className="mr-2">Add-ons: ✂ ⭐ 🎓 💊 🛁 🐾</span>
  </div>
);
