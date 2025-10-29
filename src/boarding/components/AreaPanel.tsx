import React, { useMemo } from 'react';
import type { Run, Stay } from '../../boarding/types';
import { RunCell } from './RunCell';

interface AreaPanelProps {
  areaLabel: string;
  runs: Run[];
  stays: Stay[];
  onDragStart?: (e: React.DragEvent, stayId: string) => void;
  onDragOver?: (e: React.DragEvent, run: Run) => void;
  onDrop?: (e: React.DragEvent, run: Run) => void;
  onOpenDetails?: (stay: Stay) => void;
  onKeyboardPick?: (stayId: string) => void;
  onKeyboardDrop?: (run: Run) => void;
}

export const AreaPanel: React.FC<AreaPanelProps> = ({ areaLabel, runs, stays, onDragStart, onDragOver, onDrop, onOpenDetails, onKeyboardPick, onKeyboardDrop }) => {
  const occupancy = useMemo(() => {
    const occupiedStays = stays.filter((s) => runs.some((r) => r.code === s.runCode)).length;
    const capacity = runs.reduce((sum, r) => sum + r.capacity, 0);
    return { occupiedStays, capacity };
  }, [runs, stays]);

  return (
    <section
      className="rounded-xl bg-white p-4 avoid-break border-l-4"
      style={{ borderLeftColor: 'var(--phz-purple, #372879)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--phz-purple-main,#372879)]">{areaLabel}</h3>
        <span className="rounded px-2 py-1 text-xs font-semibold text-white shadow"
          style={{ backgroundColor: 'var(--phz-blue, #30A7D8)' }}
        >
          {occupancy.occupiedStays}/{occupancy.capacity}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-4">
        {runs.map((run) => (
          <RunCell
            key={run.code}
            run={run}
            stays={stays.filter((s) => s.runCode === run.code)}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onOpenDetails={onOpenDetails}
            onKeyboardPick={onKeyboardPick}
            onKeyboardDrop={onKeyboardDrop}
          />
        ))}
      </div>
    </section>
  );
};
