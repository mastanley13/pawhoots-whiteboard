import React, { useState, useEffect } from 'react';
import type { Stay } from '../types';
import { formatTime } from '../utils';

interface PetDetailsModalProps {
  open: boolean;
  onClose: () => void;
  stay?: Stay | null;
  onSaveNotes?: (notes: string) => void;
  onUpdateStatus?: (status: 'expected'|'checked_in'|'checked_out') => void;
}

export const PetDetailsModal: React.FC<PetDetailsModalProps> = ({ open, onClose, stay, onSaveNotes, onUpdateStatus }) => {
  if (!open || !stay) return null;
  const [notes, setNotes] = useState(stay.notes || '');
  useEffect(() => { setNotes(stay.notes || ''); }, [stay]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 text-sm font-semibold">{stay.petName}</div>
        <div className="space-y-1 text-xs text-gray-700">
          {stay.guardian && (
            <div>
              <span className="text-gray-500">Guardian:</span> {stay.guardian}
            </div>
          )}
          <div>
            <span className="text-gray-500">Run:</span> {stay.runCode}
          </div>
          <div>
            <span className="text-gray-500">Time:</span> {formatTime(stay.startAt)} – {formatTime(stay.endAt)}
          </div>
          {stay.addOns?.length > 0 && (
            <div>
              <span className="text-gray-500">Add-ons:</span> {stay.addOns.join(', ')}
            </div>
          )}
          {stay.notes && (
            <div className="hidden" />
          )}
          <label className="block text-gray-500">Notes</label>
          <textarea
            className="w-full rounded border border-gray-300 p-2 text-xs"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {onUpdateStatus && (
            <div className="flex gap-2">
              {stay.status !== 'checked_in' && (
                <button
                  className="rounded bg-green-600 px-3 py-1 text-xs text-white"
                  onClick={() => onUpdateStatus('checked_in')}
                >
                  Check In
                </button>
              )}
              {stay.status !== 'checked_out' && (
                <button
                  className="rounded bg-gray-700 px-3 py-1 text-xs text-white"
                  onClick={() => onUpdateStatus('checked_out')}
                >
                  Check Out
                </button>
              )}
            </div>
          )}
          <button className="rounded border border-gray-300 px-3 py-1 text-xs" onClick={onClose}>
            Close
          </button>
          {onSaveNotes && (
            <button
              className="rounded bg-[var(--phz-orange,#F04A24)] px-3 py-1 text-xs text-white"
              onClick={() => onSaveNotes(notes)}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
