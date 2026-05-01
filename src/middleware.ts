import { defineMiddleware } from 'astro:middleware';
import { isAuthed } from './lib/auth';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;

  const isAdminArea =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/');

  const isPublicAdminEndpoint =
    pathname === '/admin' ||
    pathname === '/admin/' ||
    pathname === '/api/admin/login';

  if (isAdminArea && !isPublicAdminEndpoint) {
    if (!isAuthed(ctx.cookies)) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return ctx.redirect('/admin');
    }
  }

  return next();
});
