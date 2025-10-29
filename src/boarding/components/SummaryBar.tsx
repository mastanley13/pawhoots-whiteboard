import React from 'react';

interface SummaryBarProps {
  date: Date;
  totals?: { runs: number; occupied: number; capacity: number; arrivals: number; departures: number };
  onPrint?: () => void;
  onChangeDate?: (next: Date) => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}

export const SummaryBar: React.FC<SummaryBarProps> = ({ date, totals, onPrint, onChangeDate, prevDisabled, nextDisabled }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 shadow">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="font-semibold">Boarding —</span>
        <div className="flex items-center gap-2">
          {onChangeDate && (
            <>
              <button
                className="rounded border border-gray-300 px-2 text-xs hover:bg-gray-50 disabled:opacity-50"
                onClick={() => onChangeDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1))}
                disabled={prevDisabled}
              >
                ◀
              </button>
              <button
                className="rounded border border-gray-300 px-2 text-xs hover:bg-gray-50"
                onClick={() => onChangeDate(new Date())}
              >
                Today
              </button>
              <button
                className="rounded border border-gray-300 px-2 text-xs hover:bg-gray-50 disabled:opacity-50"
                onClick={() => onChangeDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))}
                disabled={nextDisabled}
              >
                ▶
              </button>
            </>
          )}
          <span>{date.toLocaleDateString()}</span>
        </div>
      </div>
      {totals && (
        <div className="flex gap-4 text-xs text-gray-700">
          <span>Runs: {totals.runs}</span>
          <span>Occupied: {totals.occupied}/{totals.capacity}</span>
          <span>Arrivals: {totals.arrivals}</span>
          <span>Departures: {totals.departures}</span>
        </div>
      )}
      {onPrint && (
        <button onClick={onPrint} className="no-print rounded bg-[var(--phz-orange-main,#F04A24)] px-3 py-1 text-xs font-semibold text-white">
          Print
        </button>
      )}
    </div>
  );
};
