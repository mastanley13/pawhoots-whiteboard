import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'server', 'data');
try {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('Deleted', dir);
} catch (e) {
  console.error('Failed to delete', dir, e);
}

