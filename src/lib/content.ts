import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '..', 'content');

export const PAGES = ['site', 'home', 'about', 'contact', 'calendar', 'forms', 'schedules', 'rosters'] as const;
export type PageKey = typeof PAGES[number];

// Vite eagerly bundles every content JSON into the build output. On Netlify Functions
// the source `src/content/*.json` files aren't present at runtime, so this is the
// only reliable way to read content there. In dev we still prefer the filesystem so
// edits show up without restarting.
const bundled = import.meta.glob<{ default: any }>('../content/*.json', { eager: true });
function bundledFor(key: PageKey): any | undefined {
  return bundled[`../content/${key}.json`]?.default;
}

export async function loadContent<T = any>(key: PageKey): Promise<T> {
  const file = path.join(CONTENT_DIR, `${key}.json`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch (e: any) {
    // Production / Netlify Function runtime: the file isn't on disk. Fall back to bundled.
    if (e.code === 'ENOENT' || e.code === 'EACCES' || e.code === 'EROFS') {
      const data = bundledFor(key);
      if (data === undefined) throw new Error(`unknown content: ${key}`);
      return data as T;
    }
    throw e;
  }
}

export async function saveContent(key: PageKey, data: unknown): Promise<void> {
  const file = path.join(CONTENT_DIR, `${key}.json`);
  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch (e: any) {
    // Read-only FS on Netlify is expected — GitHub commit (in persist.ts) carries the persistence load.
    if (e.code === 'ENOENT' || e.code === 'EACCES' || e.code === 'EROFS') return;
    throw e;
  }
}

export function contentDir() {
  return CONTENT_DIR;
}
