import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED: Record<string, string[]> = {
  '/admin': ['admin'],
  '/rh': ['admin', 'rh'],
  '/gestionnaire': ['admin', 'event_manager'],
  '/membre': ['admin', 'rh', 'member', 'event_manager'],
};

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => { res = NextResponse.next({ request: req }); list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const key = Object.keys(PROTECTED).find((p) => req.nextUrl.pathname.startsWith(p));
  if (!key) return res;
  if (!user) return NextResponse.redirect(new URL('/connexion', req.url));
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !PROTECTED[key].includes(profile.role)) return NextResponse.redirect(new URL('/membre', req.url));
  return res;
}
export const config = { matcher: ['/admin/:path*', '/rh/:path*', '/gestionnaire/:path*', '/membre/:path*'] };
