import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '..', 'content');

export const PAGES = ['site', 'home', 'about', 'contact', 'calendar', 'forms', 'schedules', 'rosters'] as const;
export type PageKey = typeof PAGES[number];

export async function loadContent<T = any>(key: PageKey): Promise<T> {
  const file = path.join(CONTENT_DIR, `${key}.json`);
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw) as T;
}

export async function saveContent(key: PageKey, data: unknown): Promise<void> {
  const file = path.join(CONTENT_DIR, `${key}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function contentDir() {
  return CONTENT_DIR;
}
