import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-gray-600 md:flex-row">
        <p className="font-medium text-[var(--phz-purple)]">
          PawHootz Pet Resort Whiteboard
        </p>
        <div className="flex items-center gap-4">
          <p>&copy; {new Date().getFullYear()} PawHootz Pet Resort. All rights reserved.</p>
          <a className="text-[var(--phz-blue)] hover:underline" href="https://pawhootz.com/" target="_blank" rel="noopener noreferrer">
            pawhootz.com
          </a>
        </div>
      </div>
    </footer>
  );
};
