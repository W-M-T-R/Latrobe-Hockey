import type { PageKey } from './content';

export type DocRef = { page: PageKey; dot: string };
export type Document = {
  id: string;
  label: string;
  description?: string;
  group: 'season' | 'standing';
  refs: DocRef[];
  // If set, the doc supports a visible/hidden toggle on its dedicated page.
  // The dot path points at a boolean flag inside the page's JSON.
  visibilityRef?: DocRef;
  // Friendly name of the page this hides on, for UI labels.
  visibilityPage?: string;
};

// Each entry maps a friendly document name to every JSON path that holds its URL.
// When the secretary uploads a new file, the document-replace endpoint walks every ref
// and updates the URL in one go.
//
// IMPORTANT: refs use index-based paths into existing JSON shapes. If you reorder
// home.json/quickLinks or forms.json/primary[*] in Advanced mode, update the indexes here.
export const DOCUMENTS: Document[] = [
  {
    id: 'registration-packet',
    label: 'Registration Packet',
    description: '2025–2026 player & parent forms (one PDF).',
    group: 'season',
    refs: [
      { page: 'home',  dot: 'quickLinks.0.href' },
      { page: 'forms', dot: 'primary.0.href' },
      { page: 'forms', dot: 'packetPdfHref' },
    ],
  },
  {
    id: 'summer-ice-schedule',
    label: 'Summer Ice Schedule',
    description: 'Tryout dates, times, and locations.',
    group: 'season',
    refs: [
      { page: 'home',  dot: 'hero.primaryCta.href' },
      { page: 'home',  dot: 'quickLinks.1.href' },
      { page: 'forms', dot: 'primary.1.href' },
    ],
  },
  {
    id: 'rosters',
    label: 'Team Rosters',
    description: 'Single PDF with all three teams.',
    group: 'season',
    refs: [
      { page: 'rosters', dot: 'pdfHref' },
      { page: 'home',    dot: 'quickLinks.2.href' },
    ],
    visibilityRef: { page: 'rosters', dot: 'pdfVisible' },
    visibilityPage: 'Rosters',
  },
  {
    id: 'schedule-varsity',
    label: 'Varsity Schedule',
    description: 'Varsity team game schedule.',
    group: 'season',
    refs: [
      { page: 'schedules', dot: 'teams.0.pdfHref' },
      { page: 'home',      dot: 'quickLinks.3.href' },
    ],
    visibilityRef: { page: 'schedules', dot: 'teams.0.pdfVisible' },
    visibilityPage: 'Schedules',
  },
  {
    id: 'schedule-jv',
    label: 'Junior Varsity Schedule',
    description: 'JV team game schedule.',
    group: 'season',
    refs: [
      { page: 'schedules', dot: 'teams.1.pdfHref' },
      { page: 'home',      dot: 'quickLinks.4.href' },
    ],
    visibilityRef: { page: 'schedules', dot: 'teams.1.pdfVisible' },
    visibilityPage: 'Schedules',
  },
  {
    id: 'schedule-ms',
    label: 'Middle School Schedule',
    description: 'Middle School team game schedule.',
    group: 'season',
    refs: [
      { page: 'schedules', dot: 'teams.2.pdfHref' },
      { page: 'home',      dot: 'quickLinks.5.href' },
    ],
    visibilityRef: { page: 'schedules', dot: 'teams.2.pdfVisible' },
    visibilityPage: 'Schedules',
  },
  {
    id: 'calendar',
    label: 'Season Calendar',
    description: 'Practices, games, fundraisers, and key dates.',
    group: 'season',
    refs: [
      { page: 'calendar', dot: 'pdfHref' },
    ],
    visibilityRef: { page: 'calendar', dot: 'pdfVisible' },
    visibilityPage: 'Calendar',
  },
  {
    id: 'lucky-lottery',
    label: 'Lucky Lottery Calendar Fundraiser',
    description: 'Annual fundraiser details.',
    group: 'standing',
    refs: [
      { page: 'forms', dot: 'policies.1.href' },
    ],
  },
  {
    id: 'locker-room-policy',
    label: 'Locker Room Policy',
    description: 'GLHC locker room safety guidelines.',
    group: 'standing',
    refs: [
      { page: 'forms', dot: 'policies.0.href' },
    ],
  },
  {
    id: 'bylaws',
    label: 'GLHC By-Laws',
    description: 'Club governance document.',
    group: 'standing',
    refs: [
      { page: 'forms', dot: 'policies.3.href' },
      { page: 'about', dot: 'documents.0.href' },
    ],
  },
];

export function getByDot(obj: any, dot: string): any {
  const parts = dot.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    const k = /^\d+$/.test(p) ? Number(p) : p;
    cur = cur[k];
  }
  return cur;
}

export function setByDot(obj: any, dot: string, value: any): void {
  const parts = dot.split('.');
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    const k = /^\d+$/.test(p) ? Number(p) : p;
    if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]!) ? [] : {};
    cur = cur[k];
  }
  const last = parts[parts.length - 1]!;
  const k = /^\d+$/.test(last) ? Number(last) : last;
  cur[k] = value;
}

// Map of which homepage quickLinks slot belongs to which document (for visibility toggles).
export const HOMEPAGE_SLOTS: { documentId: string; quickLinkIndex: number }[] = [
  { documentId: 'registration-packet', quickLinkIndex: 0 },
  { documentId: 'summer-ice-schedule', quickLinkIndex: 1 },
  { documentId: 'rosters', quickLinkIndex: 2 },
  { documentId: 'schedule-varsity', quickLinkIndex: 3 },
  { documentId: 'schedule-jv', quickLinkIndex: 4 },
  { documentId: 'schedule-ms', quickLinkIndex: 5 },
];
