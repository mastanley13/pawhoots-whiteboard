import React from 'react';

export interface BoardingFilterState {
  area: string; // 'ALL' or area code like 'LL', 'TK', etc.
  vacantOnly: boolean;
  persist: boolean;
}

interface BoardingFiltersProps {
  areas: Array<{ code: string; label: string }>;
  value: BoardingFilterState;
  onChange: (next: BoardingFilterState) => void;
}

export const BoardingFilters: React.FC<BoardingFiltersProps> = ({ areas, value, onChange }) => {
  const setArea = (area: string) => onChange({ ...value, area });
  const setVacantOnly = (vacantOnly: boolean) => onChange({ ...value, vacantOnly });
  const setPersist = (persist: boolean) => onChange({ ...value, persist });

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg bg-white p-3 shadow">
      <label className="text-xs text-gray-700">
        <span className="mr-2">Area</span>
        <select
          className="rounded border border-gray-300 bg-white p-1 text-xs"
          value={value.area}
          onChange={(e) => setArea(e.target.value)}
        >
          <option value="ALL">All Areas</option>
          {areas.map((a) => (
            <option key={a.code} value={a.code}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={value.vacantOnly}
          onChange={(e) => setVacantOnly(e.target.checked)}
        />
        Vacant only
      </label>

      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={value.persist}
          onChange={(e) => setPersist(e.target.checked)}
        />
        Persist changes (local)
      </label>
    </div>
  );
};
