import type { APIRoute } from 'astro';
import { DOCUMENTS, setByDot } from '../../../lib/documents';
import { loadContent } from '../../../lib/content';
import { persistContent } from '../../../lib/persist';

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid json' }, 400); }

  const documentId = String(body.documentId ?? '');
  const visible = !!body.visible;

  const doc = DOCUMENTS.find((d) => d.id === documentId);
  if (!doc) return json({ error: 'unknown document' }, 400);
  if (!doc.visibilityRef) return json({ error: 'this document has no visibility toggle' }, 400);

  try {
    const data = await loadContent<any>(doc.visibilityRef.page);
    setByDot(data, doc.visibilityRef.dot, visible);
    await persistContent(doc.visibilityRef.page, data);
    return json({ ok: true, visible });
  } catch (e: any) {
    return json({ error: e.message || 'visibility update failed' }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
