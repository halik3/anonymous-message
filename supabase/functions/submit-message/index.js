import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function getClientAddress(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const address =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    (forwarded ? forwarded.split(',').at(-1).trim() : '')

  return address && address.length <= 128 ? address : null
}

async function hashAddress(address, keyMaterial) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(keyMaterial),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(address))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400)
  }

  const content = typeof payload?.content === 'string' ? payload.content.trim() : ''
  if (!content || content.length > 1000) {
    return jsonResponse({ error: 'Message must contain 1 to 1000 characters.' }, 400)
  }

  const address = getClientAddress(request)
  if (!address) {
    return jsonResponse({ error: 'Could not verify the request source. Please try again.' }, 503)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Required Supabase function environment variables are missing.')
    return jsonResponse({ error: 'Message service is temporarily unavailable.' }, 500)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const ipHash = await hashAddress(address, serviceRoleKey)
  const { data: allowed, error: limitError } = await adminClient.rpc(
    'consume_message_rate_limit',
    {
      p_ip_hash: ipHash,
      p_max_requests: 5,
      p_window_seconds: 600,
    },
  )

  if (limitError) {
    console.error('Message rate-limit check failed:', limitError.message)
    return jsonResponse({ error: 'Message service is temporarily unavailable.' }, 500)
  }
  if (!allowed) {
    return jsonResponse({ error: 'Please wait a few minutes before sending another message.' }, 429)
  }

  const { error: insertError } = await adminClient
    .from('messages')
    .insert({ content })

  if (insertError) {
    console.error('Message insert failed:', insertError.message)
    return jsonResponse({ error: 'Could not save your message. Please try again.' }, 500)
  }

  return jsonResponse({ success: true }, 201)
})
