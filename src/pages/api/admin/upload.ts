import type { APIRoute } from 'astro';
import { persistImage } from '../../../lib/persist';

const MAX_BYTES = 25 * 1024 * 1024; // 25MB
const ALLOWED_PREFIXES = ['image/', 'application/pdf'];

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try { form = await request.formData(); }
  catch { return json({ error: 'invalid form data' }, 400); }

  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'no file' }, 400);
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p) || (p === 'application/pdf' && file.name.toLowerCase().endsWith('.pdf')))) {
    return json({ error: 'only images and PDFs allowed' }, 400);
  }
  if (file.size > MAX_BYTES) return json({ error: 'file too large (max 25MB)' }, 400);

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const { url, via } = await persistImage(file.name, buf);
    return json({ ok: true, url, via });
  } catch (e: any) {
    return json({ error: e.message || 'upload failed' }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
