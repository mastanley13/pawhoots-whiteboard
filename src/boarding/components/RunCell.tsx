import React from 'react';
import type { Run, Stay } from '../types';
import { formatTime } from '../utils';

interface RunCellProps {
  run: Run;
  stays: Stay[];
  onDragStart?: (e: React.DragEvent, stayId: string) => void;
  onDragOver?: (e: React.DragEvent, run: Run) => void;
  onDrop?: (e: React.DragEvent, run: Run) => void;
  onOpenDetails?: (stay: Stay) => void;
  onKeyboardPick?: (stayId: string) => void;
  onKeyboardDrop?: (run: Run) => void;
}

export const RunCell: React.FC<RunCellProps> = ({ run, stays, onDragStart, onDragOver, onDrop, onOpenDetails, onKeyboardPick, onKeyboardDrop }) => {
  const occupied = stays.length;
  const vacant = Math.max(0, run.capacity - occupied);

  const getStatusBadge = (status: Stay['status']) => {
    switch (status) {
      case 'checked_in':
        return { label: 'In', cls: 'border-green-300 bg-green-100 text-green-700' };
      case 'checked_out':
        return { label: 'Out', cls: 'border-purple-300 bg-purple-100 text-purple-700' };
      default:
        return { label: 'Expected', cls: 'border-gray-300 bg-gray-100 text-gray-700' };
    }
  };
  return (
    <div
      className="rounded border border-gray-200 bg-white p-2 text-xs min-w-[180px] focus:outline focus:outline-2 focus:outline-[var(--phz-blue,#30A7D8)]"
      onDragOver={(e) => {
        if (onDragOver) onDragOver(e, run);
      }}
      onDrop={(e) => {
        if (onDrop) onDrop(e, run);
      }}
      role="listitem"
      aria-label={`Run ${run.code}, ${occupied} occupied of ${run.capacity}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onKeyboardDrop && onKeyboardDrop(run);
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{run.code}</span>
        <span className="text-gray-500">{occupied}/{run.capacity}</span>
      </div>
      <div className="mt-1 space-y-1">
        {stays.map((s) => (
          <div
            key={s.id}
            className="group rounded border p-1 cursor-grab active:cursor-grabbing border-l-4 hover:bg-[#EEF8FF] hover:shadow-sm transition-colors"
            style={{ borderColor: '#D6ECFF', backgroundColor: '#F7FAFF', borderLeftColor: 'var(--phz-blue, #30A7D8)' }}
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, s.id)}
            onClick={() => onOpenDetails && onOpenDetails(s)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' && !e.shiftKey) || e.key === ' ') {
                e.preventDefault();
                onOpenDetails && onOpenDetails(s);
              } else if (e.key.toLowerCase() === 'm' || (e.key === 'Enter' && e.shiftKey)) {
                // Keyboard pickup without visible button
                e.preventDefault();
                onKeyboardPick && onKeyboardPick(s.id);
              }
            }}
            tabIndex={0}
            aria-grabbed={true}
            role="option"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[12px] text-[var(--phz-purple,#372879)]">{s.petName}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`hidden sm:inline rounded-full border px-2 py-[1px] text-[10px] ${getStatusBadge(s.status).cls}`}
                >
                  {getStatusBadge(s.status).label}
                </span>
                <span className="text-[11px] text-gray-700">
                  {formatTime(s.startAt)} - {formatTime(s.endAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-1 text-[10px] text-gray-700">
              {s.guardian && <span className="truncate">{s.guardian}</span>}
              {s.arrivalToday && <span className="text-green-600">•</span>}
              {s.departureToday && <span className="text-purple-600">|</span>}
            </div>
          </div>
        ))}
        {vacant > 0 && (
          <div className="text-[10px] italic text-gray-400">{vacant} vacant</div>
        )}
      </div>
    </div>
  );
};

export default RunCell;
