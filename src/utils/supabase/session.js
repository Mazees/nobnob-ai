import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  const pathname = request.nextUrl.pathname
  const isDashboard =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  const redirectToLogin = (error) => {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search = ''
    url.searchParams.set('error', error)

    const redirect = NextResponse.redirect(url)
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie)
    }

    for (const name of ['cache-control', 'pragma', 'expires']) {
      const value = response.headers.get(name)
      if (value !== null) redirect.headers.set(name, value)
    }
    redirect.headers.set('cache-control', 'private, no-store')
    return redirect
  }

  if (!url || !key) return isDashboard ? redirectToLogin('unavailable') : response

  const pendingCookies = new Map()
  const pendingHeaders = new Headers()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          pendingCookies.set(name, { name, value, options })
        })
        Object.entries(headers || {}).forEach(([name, value]) => {
          pendingHeaders.set(name, value)
        })

        response = NextResponse.next({ request })
        pendingCookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
        pendingHeaders.forEach((value, name) => {
          response.headers.set(name, value)
        })
      },
    },
  })

  try {
    const { data, error } = await supabase.auth.getClaims()
    if (isDashboard) {
      if (error || !data?.claims?.sub) return redirectToLogin('denied')

      const email = typeof data.claims.email === 'string'
        ? data.claims.email.trim().toLowerCase()
        : ''
      if (!email) return redirectToLogin('denied')

      const { data: user, error: userError } = await supabase
        .schema('public')
        .from('users')
        .select('id')
        .eq('email', email)
        .is('revoked_at', null)
        .maybeSingle()

      if (userError) return redirectToLogin('unavailable')
      if (!user) return redirectToLogin('denied')
    }
  } catch {
    if (isDashboard) return redirectToLogin('unavailable')
  }
  return response
}
