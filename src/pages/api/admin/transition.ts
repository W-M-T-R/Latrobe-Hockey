import type { APIRoute } from 'astro';
import { loadContent } from '../../../lib/content';
import { persistContent } from '../../../lib/persist';

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: 'invalid json' }, 400); }

  const action = String(body.action ?? '');

  try {
    if (action === 'switch-to-summer') {
      // Clear last season's docs so pages show "Coming Soon"
      const rosters = await loadContent<any>('rosters');
      rosters.pdfHref = '';
      rosters.pdfVisible = true;
      await persistContent('rosters', rosters);

      const schedules = await loadContent<any>('schedules');
      for (const t of schedules.teams ?? []) { t.pdfHref = ''; t.pdfVisible = true; }
      await persistContent('schedules', schedules);

      const calendar = await loadContent<any>('calendar');
      calendar.pdfHref = '';
      calendar.pdfVisible = true;
      await persistContent('calendar', calendar);

      const home = await loadContent<any>('home');
      const ql = home.quickLinks ?? [];
      // Show registration packet + summer ice (slots 0, 1) and the two summer fundraisers (slots 6, 7)
      if (ql[0]) ql[0].visible = true;
      if (ql[1]) ql[1].visible = true;
      if (ql[6]) ql[6].visible = true;
      if (ql[7]) ql[7].visible = true;
      // Hide and clear rosters + schedules (slots 2-5)
      for (let i = 2; i <= 5; i++) {
        if (ql[i]) {
          ql[i].visible = false;
          ql[i].href = '';
        }
      }
      await persistContent('home', home);
      return json({ ok: true, mode: 'summer' });
    }

    if (action === 'switch-to-season') {
      const home = await loadContent<any>('home');
      const ql = home.quickLinks ?? [];
      // Hide registration packet + summer ice + summer fundraisers (slots 0, 1, 6, 7)
      if (ql[0]) ql[0].visible = false;
      if (ql[1]) ql[1].visible = false;
      if (ql[6]) ql[6].visible = false;
      if (ql[7]) ql[7].visible = false;
      // Show rosters + schedules (slots 2-5)
      for (let i = 2; i <= 5; i++) {
        if (ql[i]) ql[i].visible = true;
      }
      await persistContent('home', home);
      return json({ ok: true, mode: 'season' });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e.message || 'transition failed' }, 500);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
