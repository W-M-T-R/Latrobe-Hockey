import type { APIRoute } from 'astro';
import { checkPassword, setSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  if (!checkPassword(password)) {
    return redirect('/admin?error=1', 303);
  }
  setSession(cookies);
  return redirect('/admin/dashboard', 303);
};
