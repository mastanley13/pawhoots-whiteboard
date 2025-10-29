import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const featureBoarding = (import.meta as any).env?.VITE_FEATURE_BOARDING;
  return (
    <header className="bg-gradient-to-r from-[#5a2d91] via-[#6936a5] to-[#f36f21] text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/employee-resources" className="flex items-center">
          <img
            src="/branding/pawhootz/PawHootz Logos.png"
            alt="PawHootz Pet Resort"
            className="h-12 w-auto drop-shadow-lg"
          />
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link
            to="/employee-resources"
            className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-[var(--phz-orange)]"
          >
            Dashboard
          </Link>
          {featureBoarding && (
            <Link
              to="/boarding"
              className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-[var(--phz-orange)]"
            >
              Boarding
            </Link>
          )}
          <a
            href="https://pawhootz.com/"
            className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-[var(--phz-orange)]"
            rel="noopener noreferrer"
          >
            pawhootz.com
          </a>
        </nav>
      </div>
    </header>
  );
};
