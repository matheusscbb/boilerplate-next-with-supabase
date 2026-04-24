import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/conta-inativa', '/licenca-expirada'];

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Redirect authenticated users away from auth pages.
  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected routes.
  if (!user && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For authenticated users on protected routes, verify account status.
  if (user && !isPublicRoute && pathname !== '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, license_expires_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      // Soft-deactivated accounts.
      if (profile.is_active === false) {
        return NextResponse.redirect(new URL('/conta-inativa', request.url));
      }

      // Trainers with an expired license (null = never expires).
      if (
        profile.role === 'trainer' &&
        profile.license_expires_at !== null &&
        new Date(profile.license_expires_at) < new Date()
      ) {
        return NextResponse.redirect(new URL('/licenca-expirada', request.url));
      }
    }
  }

  return supabaseResponse;
}
