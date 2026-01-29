// 📡 Supabase Edge Function : Telemetry Receiver
// Deploy: supabase functions deploy telemetry

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse events
    const events = await req.json()
    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Batch insert avec metadata
    const eventsToInsert = Array.isArray(events) ? events : [events]
    const records = eventsToInsert.map(event => ({
      event: event.event,
      device_id: event.deviceId,
      session_id: event.sessionId,
      properties: event.properties || {},
      user_agent: userAgent,
      ip_address: ip,
    }))

    const { data, error } = await supabase
      .from('telemetry_events')
      .insert(records)

    if (error) throw error

    // Auto-détection suspicious activity
    for (const event of eventsToInsert) {
      if (event.event === 'suspicious_activity') {
        await supabase.from('security_alerts').insert({
          event: 'suspicious_activity',
          reason: event.properties?.type || 'unknown',
          device_id: event.deviceId,
          severity: 'medium',
          data: event.properties,
          user_agent: userAgent,
          ip_address: ip,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted: records.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
