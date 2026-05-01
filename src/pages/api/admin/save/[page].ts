import type { APIRoute } from 'astro';
import { PAGES, type PageKey } from '../../../../lib/content';
import { persistContent } from '../../../../lib/persist';

export const POST: APIRoute = async ({ params, request }) => {
  const page = params.page as string;
  if (!(PAGES as readonly string[]).includes(page)) {
    return new Response(JSON.stringify({ error: 'unknown page' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
  let body: unknown;
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers: { 'content-type': 'application/json' } }); }

  try {
    const result = await persistContent(page as PageKey, body);
    return new Response(JSON.stringify({ ok: true, via: result.via }), { headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'save failed' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
