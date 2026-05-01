import type { APIRoute } from 'astro';
import { DOCUMENTS, setByDot } from '../../../lib/documents';
import { loadContent, type PageKey } from '../../../lib/content';
import { persistImage, persistContent } from '../../../lib/persist';

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = ['image/', 'application/pdf'];

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: 'invalid form data' }, 400); }

  const documentId = String(form.get('documentId') ?? '');
  const file = form.get('file');

  const doc = DOCUMENTS.find((d) => d.id === documentId);
  if (!doc) return json({ error: 'unknown document' }, 400);
  if (!(file instanceof File)) return json({ error: 'no file' }, 400);
  if (!ALLOWED.some((p) => file.type.startsWith(p) || (p === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf')))) {
    return json({ error: 'only images and PDFs allowed' }, 400);
  }
  if (file.size > MAX_BYTES) return json({ error: 'file too large (max 25MB)' }, 400);

  const bytes = Buffer.from(await file.arrayBuffer());
  let url: string, via: 'local' | 'github';
  try {
    const result = await persistImage(file.name, bytes);
    url = result.url; via = result.via;
  } catch (e: any) {
    return json({ error: e.message || 'upload failed' }, 500);
  }

  // Group refs by page, load → update → save
  const byPage = new Map<PageKey, string[]>();
  for (const ref of doc.refs) {
    const arr = byPage.get(ref.page) ?? [];
    arr.push(ref.dot);
    byPage.set(ref.page, arr);
  }

  const updatedPages: string[] = [];
  for (const [page, dots] of byPage) {
    try {
      const data = await loadContent<any>(page);
      for (const dot of dots) setByDot(data, dot, url);
      await persistContent(page, data);
      updatedPages.push(page);
    } catch (e: any) {
      return json({ error: `failed updating ${page}: ${e.message}` }, 500);
    }
  }

  return json({ ok: true, url, via, updatedPages });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
