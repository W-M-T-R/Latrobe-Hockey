import type { APIRoute } from 'astro';
import { DOCUMENTS, setByDot } from '../../../lib/documents';
import { loadContent, type PageKey } from '../../../lib/content';
import { persistContent } from '../../../lib/persist';

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid json' }, 400); }

  const documentId = String(body.documentId ?? '');
  const visible = !!body.visible;

  const doc = DOCUMENTS.find((d) => d.id === documentId);
  if (!doc) return json({ error: 'unknown document' }, 400);
  const refs = doc.visibilityRefs;
  if (!refs || refs.length === 0) return json({ error: 'this document has no visibility toggle' }, 400);

  // Group refs by page so we load each JSON once
  const byPage = new Map<PageKey, string[]>();
  for (const r of refs) {
    const arr = byPage.get(r.page) ?? [];
    arr.push(r.dot);
    byPage.set(r.page, arr);
  }

  try {
    for (const [page, dots] of byPage) {
      const data = await loadContent<any>(page);
      for (const dot of dots) setByDot(data, dot, visible);
      await persistContent(page, data);
    }
    return json({ ok: true, visible });
  } catch (e: any) {
    return json({ error: e.message || 'visibility update failed' }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
