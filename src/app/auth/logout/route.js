import { createClient } from '@/utils/supabase/server'

export async function POST(request) {
  const originHeader = request.headers.get('origin')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const protocol = forwardedProto === null ? request.nextUrl.protocol : forwardedProto + ':'
  let origin
  try {
    origin = new URL(originHeader)
  } catch {
    return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }
  if (!originHeader || !host || !['http:', 'https:'].includes(origin.protocol) ||
      origin.username || origin.password || origin.origin !== originHeader ||
      origin.host !== host || origin.protocol !== protocol) {
    return new Response('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error
  } catch (error) {
    if (error?.name !== 'AuthSessionMissingError') {
      return new Response('Service unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  }
  return new Response(null, {
    status: 303,
    headers: { Location: '/login', 'Cache-Control': 'private, no-store' },
  })
}
