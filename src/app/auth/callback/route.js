import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
  const redirect = (path) => {
    const response = NextResponse.redirect(new URL(path, request.url), 303)
    response.headers.set('Cache-Control', 'private, no-store')
    return response
  }

  let supabase
  let destination = '/login?error=oauth'
  try {
    supabase = await createClient()
    const code = request.nextUrl.searchParams.get('code')
    if (!code || request.nextUrl.searchParams.has('error')) throw new Error('OAuth callback failed')

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) throw exchangeError

    destination = '/login?error=unavailable'
    const { data: claimed, error: claimError } = await supabase.rpc('claim_whitelist_membership')
    if (claimError) throw claimError
    if (claimed === false) {
      destination = '/login?error=denied'
      throw new Error('Access denied')
    }
    if (claimed !== true) throw new Error('Invalid membership claim result')
    return redirect('/dashboard')
  } catch {
    if (supabase) {
      try { await supabase.auth.signOut({ scope: 'local' }) } catch {}
    }
    return redirect(destination)
  }
}
