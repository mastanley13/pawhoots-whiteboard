import React, { useEffect, useMemo, useState } from 'react';
import { SummaryBar } from './components/SummaryBar';
import { BoardingFilters, type BoardingFilterState } from './components/BoardingFilters';
import { AreaPanel } from './components/AreaPanel';
import { Legend } from './components/Legend';
import { PetDetailsModal } from './components/PetDetailsModal';
import { createDriver } from './boardingService';
import type { InventorySnapshot, Stay } from './types';

const driverMode = (import.meta as any).env?.VITE_BOARDING_DRIVER === 'api' ? 'api' : 'mock';
const driver = createDriver(driverMode as any);

const areaLabelMap: Record<string, string> = {
  LL: 'Labrador Lounge',
  TK: 'Texas Tails',
  RR: 'Rover Runs',
  DD: 'Doggie Digs',
  KK: 'K9 Kottages',
  CC: 'Cat Condos',
  ER: 'Enrichment Runs',
  GR: 'Groom Room',
  TC: 'Training Center',
};

export const BoardingBoard: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [snap, setSnap] = useState<InventorySnapshot | null>(null);
  const [filters, setFilters] = useState<BoardingFilterState>({ area: 'ALL', vacantOnly: false, persist: true });
  const [draggingStayId, setDraggingStayId] = useState<string | null>(null);
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [announcement, setAnnouncement] = useState<string>("");

  const storageKey = `boarding:snapshot:${date.toISOString().slice(0,10)}`;

  useEffect(() => {
    driver.getInventory(date).then((data) => {
      // Load persisted snapshot if present and allowed
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw && filters.persist) {
          const parsed = JSON.parse(raw);
          // revive dates
          parsed.stays = (parsed.stays || []).map((s: any) => ({
            ...s,
            startAt: new Date(s.startAt),
            endAt: new Date(s.endAt),
          }));
          setSnap(parsed);
          return;
        }
      } catch {}
      setSnap(data);
    }).catch((e) => {
      console.error('Failed to load inventory', e);
      setSnap({ runs: [], stays: [] });
    });
  }, [date]);

  const totals = useMemo(() => {
    if (!snap) return undefined;
    const capacity = snap.runs.reduce((sum, r) => sum + r.capacity, 0);
    const occupied = snap.stays.length; // count stays occupying slots
    return {
      runs: snap.runs.length,
      occupied,
      capacity,
      arrivals: snap.stays.filter((s) => s.arrivalToday).length,
      departures: snap.stays.filter((s) => s.departureToday).length,
    };
  }, [snap]);

  const runsByArea = useMemo(() => {
    const map: Record<string, typeof snap.runs> = {} as any;
    if (!snap) return map;
    for (const run of snap.runs) {
      const key = run.areaCode as unknown as string;
      (map[key] ||= []).push(run);
    }
    return map;
  }, [snap]);

  const areaOptions = useMemo(
    () => Object.keys(runsByArea).map((code) => ({ code, label: areaLabelMap[code] ?? code })),
    [runsByArea],
  );

  const handleDragStart = (e: React.DragEvent, stayId: string) => {
    setDraggingStayId(stayId);
    try { e.dataTransfer.setData('text/plain', stayId); } catch {}
    e.dataTransfer.effectAllowed = 'move';
    setAnnouncement('Picked up card. Choose a destination run.');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const applyMove = async (stayId: string, targetRunCode: string) => {
    if (!snap) return false;
    const run = snap.runs.find((r) => r.code === targetRunCode);
    if (!run) return false;
    const stay = snap.stays.find((s) => s.id === stayId);
    if (!stay || stay.runCode === targetRunCode) return false;
    const occupiedCount = snap.stays.filter((s) => s.runCode === run.code).length;
    const canAccept = occupiedCount < run.capacity;
    if (!canAccept) {
      setAnnouncement('Destination is full. Move canceled.');
      return false;
    }
    const next = { ...snap, stays: snap.stays.map((s) => (s.id === stayId ? { ...s, runCode: targetRunCode } : s)) };
    setSnap(next);
    if (filters.persist) {
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    }
    try { await driver.moveStay?.(stayId, targetRunCode, date); } catch {}
    setAnnouncement('Moved card successfully.');
    return true;
  };

  const handleDrop = async (e: React.DragEvent, targetRun: any) => {
    e.preventDefault();
    if (!snap) return;
    const stayId = draggingStayId || (() => { try { return e.dataTransfer.getData('text/plain'); } catch { return null; } })();
    if (!stayId) return;
    await applyMove(stayId, targetRun.code);
    setDraggingStayId(null);
  };

  const handleKeyboardPick = (stayId: string) => {
    setDraggingStayId(stayId);
    setAnnouncement('Picked up card. Focus a run and press Enter to drop.');
  };

  const handleKeyboardDrop = async (run: any) => {
    if (!draggingStayId) return;
    await applyMove(draggingStayId, run.code);
    setDraggingStayId(null);
  };

  if (!snap) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4">
      <SummaryBar
        date={date}
        totals={totals}
        onPrint={() => window.print()}
        onChangeDate={(next) => setDate(new Date(next.getFullYear(), next.getMonth(), next.getDate()))}
        prevDisabled={Math.floor((date.getTime() - new Date().setHours(0,0,0,0)) / 86400000) <= -7}
        nextDisabled={Math.floor((date.getTime() - new Date().setHours(0,0,0,0)) / 86400000) >= 7}
      />
      <div className="no-print space-y-3">
        <BoardingFilters areas={areaOptions} value={filters} onChange={setFilters} />
        <Legend />
      </div>
      <div aria-live="polite" className="sr-only">{announcement}</div>
      <div className="space-y-6">
        {Object.entries(runsByArea)
          .filter(([area]) => filters.area === 'ALL' || area === filters.area)
          .map(([area, runs]) => {
            const staysInArea = snap.stays.filter((s) => runs.some((r) => r.code === s.runCode));
            const runsFiltered = filters.vacantOnly
              ? runs.filter((r) => staysInArea.filter((s) => s.runCode === r.code).length < r.capacity)
              : runs;
            if (runsFiltered.length === 0) return null;
            return (
              <AreaPanel
                key={area}
                areaLabel={areaLabelMap[area] ?? area}
                runs={runsFiltered}
                stays={staysInArea}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onOpenDetails={(stay) => setSelectedStay(stay)}
                onKeyboardPick={handleKeyboardPick}
                onKeyboardDrop={handleKeyboardDrop}
              />
            );
          })}
      </div>
      {/* Modal */}
      <PetDetailsModal
        open={!!selectedStay}
        stay={selectedStay}
        onClose={() => setSelectedStay(null)}
        onSaveNotes={async (notes) => {
          if (!selectedStay || !snap) return;
          // Update local snapshot
          const next = { ...snap, stays: snap.stays.map((s) => (s.id === selectedStay.id ? { ...s, notes } : s)) };
          setSnap(next);
          if (filters.persist) {
            try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
          }
          try { await driver.updateNotes?.(selectedStay.id, notes, date); } catch {}
          setSelectedStay(null);
        }}
        onUpdateStatus={async (status) => {
          if (!selectedStay || !snap) return;
          const next = { ...snap, stays: snap.stays.map((s) => (s.id === selectedStay.id ? { ...s, status } : s)) };
          setSnap(next);
          if (filters.persist) {
            try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
          }
          try { await driver.updateStatus?.(selectedStay.id, status, date); } catch {}
          setSelectedStay(null);
        }}
      />
    </div>
  );
};

export default BoardingBoard;
