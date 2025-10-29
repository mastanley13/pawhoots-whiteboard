// Minimal mock backend for Boarding API (no deps)
// Runs at http://localhost:8787 by default
import http from 'node:http';
import { parse as parseUrl } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

// Inventory generation (matches frontend inventory.ts)
const range = (n, prefix) => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`);
const LL = range(18, 'LL');
const TK = range(12, 'TK');
const RR = range(14, 'RR');
const DD = range(18, 'DD');
const KK = range(5, 'KK');
const CC = range(18, 'CC');
const ER = range(6, 'ER');
const GR = range(12, 'GR');
const TC = range(10, 'TC');

const runs = [
  ...LL.map((code) => ({ code, areaCode: 'LL', capacity: 1 })),
  ...TK.map((code) => ({ code, areaCode: 'TK', capacity: 1 })),
  ...RR.map((code) => ({ code, areaCode: 'RR', capacity: 1 })),
  ...DD.map((code) => ({ code, areaCode: 'DD', capacity: 1 })),
  ...KK.map((code) => ({ code, areaCode: 'KK', capacity: 1 })),
  ...CC.map((code) => ({ code, areaCode: 'CC', capacity: 2, subSlots: ['top', 'bottom'] })),
  ...ER.map((code) => ({ code, areaCode: 'ER', capacity: 1 })),
  ...GR.map((code) => ({ code, areaCode: 'GR', capacity: 1 })),
  ...TC.map((code) => ({ code, areaCode: 'TC', capacity: 1 })),
];

// Deterministic PRNG
const seedFromDate = (isoDate) => Number(isoDate.replace(/-/g, ''));
function prng(seed) {
  let s = seed | 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const PET_NAMES = ['Luna','Bella','Charlie','Max','Daisy','Cooper','Milo','Lucy','Bailey','Sadie','Rocky','Zoe','Buddy','Tucker','Bear','Molly','Chloe','Stella','Penny','Rosie'];
const GUARDIAN_LAST = ['Smith','Johnson','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee'];

const generateSnapshot = (dateStr) => {
  const rnd = prng(seedFromDate(dateStr));
  const stays = [];
  for (const run of runs) {
    if (rnd() < 0.6) {
      const startHour = Math.floor(8 + rnd() * 2); // 8–10am
      const endHour = Math.floor(18 + rnd() * 2); // 6–8pm
      const addOnPool = ['groom', 'enrichment', 'training', 'meds', 'bath', 'nails'];
      const addOns = addOnPool.filter(() => rnd() < 0.15);
      const petName = PET_NAMES[Math.floor(rnd() * PET_NAMES.length)];
      const guardian = `${GUARDIAN_LAST[Math.floor(rnd() * GUARDIAN_LAST.length)]} Family`;
      const date = new Date(dateStr);
      const startAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour);
      const endAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour);
      stays.push({
        id: `${run.code}-${startHour}`,
        petId: undefined,
        petName,
        guardian,
        runCode: run.code,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: rnd() < 0.8 ? 'checked_in' : 'expected',
        addOns,
        arrivalToday: true,
        departureToday: rnd() < 0.5,
        notes: rnd() < 0.2 ? 'Sensitive stomach' : undefined,
      });
    }
  }
  return { runs, stays };
};

// In-memory mutations by date (optional)
const state = new Map(); // key: dateStr, value: { runs, stays }

const json = (res, code, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const fileForDate = (dateStr) => path.join(DATA_DIR, `${dateStr}.json`);

function ensureDir(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
}

function loadSnapshot(dateStr) {
  ensureDir(DATA_DIR);
  const file = fileForDate(dateStr);
  if (fs.existsSync(file)) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {}
  }
  const snap = generateSnapshot(dateStr);
  saveSnapshot(dateStr, snap);
  return snap;
}

function saveSnapshot(dateStr, snap) {
  ensureDir(DATA_DIR);
  const file = fileForDate(dateStr);
  try {
    fs.writeFileSync(file, JSON.stringify(snap, null, 2), 'utf8');
  } catch {}
}

const server = http.createServer(async (req, res) => {
  const { pathname, query } = parseUrl(req.url, true);

  if (req.method === 'GET' && pathname === '/api/boarding/inventory') {
    const date = (query && query.date) || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(res, 400, { error: 'invalid date' });
    const snap = state.get(date) || loadSnapshot(date);
    state.set(date, snap);
    return json(res, 200, snap);
  }

  if (req.method === 'POST' && pathname === '/api/boarding/move') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { stayId, targetRun, date } = JSON.parse(body || '{}');
        const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
        const snap = state.get(day) || loadSnapshot(day);
        const runExists = runs.some((r) => r.code === targetRun);
        if (!runExists) return json(res, 404, { error: 'run not found' });
        const idx = snap.stays.findIndex((s) => s.id === stayId);
        if (idx === -1) return json(res, 404, { error: 'stay not found' });
        const targetCount = snap.stays.filter((s) => s.runCode === targetRun).length;
        const capacity = runs.find((r) => r.code === targetRun)?.capacity || 1;
        if (targetCount >= capacity) return json(res, 409, { error: 'capacity full' });
        snap.stays[idx].runCode = targetRun;
        state.set(day, snap);
        saveSnapshot(day, snap);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'bad request' });
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/boarding/note') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { stayId, notes, date } = JSON.parse(body || '{}');
        const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
        const snap = state.get(day) || loadSnapshot(day);
        const idx = snap.stays.findIndex((s) => s.id === stayId);
        if (idx === -1) return json(res, 404, { error: 'stay not found' });
        snap.stays[idx].notes = String(notes || '');
        state.set(day, snap);
        saveSnapshot(day, snap);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'bad request' });
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/boarding/status') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { stayId, status, date } = JSON.parse(body || '{}');
        const day = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
        const snap = state.get(day) || loadSnapshot(day);
        const idx = snap.stays.findIndex((s) => s.id === stayId);
        if (idx === -1) return json(res, 404, { error: 'stay not found' });
        if (!['expected','checked_in','checked_out'].includes(status)) return json(res, 400, { error: 'invalid status' });
        snap.stays[idx].status = status;
        state.set(day, snap);
        saveSnapshot(day, snap);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'bad request' });
      }
    });
    return;
  }

  // Fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Boarding mock API listening on http://localhost:${PORT}`);
});
