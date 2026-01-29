// 🚨 Supabase Edge Function : Security Report Receiver
// Deploy: supabase functions deploy security-report

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Severity mapping
const SEVERITY_MAP: Record<string, string> = {
  'tampering_detected': 'critical',
  'debugger_detected': 'high',
  'devtools_detected': 'medium',
  'timing_attack': 'high',
  'integrity_violation': 'critical',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const alert = await req.json()
    const userAgent = req.headers.get('user-agent')
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Détermine severity
    const severity = SEVERITY_MAP[alert.event] || 'medium'

    // Insert alert
    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        event: alert.event,
        reason: alert.data?.reason || 'Security event detected',
        device_id: alert.deviceId || 'unknown',
        severity,
        data: alert.data || {},
        user_agent: userAgent,
        ip_address: ip,
      })
      .select()
      .single()

    if (error) throw error

    // 🔔 Alert critique → Webhook Discord/Slack (optionnel)
    if (severity === 'critical') {
      const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚨 **CRITICAL SECURITY ALERT**`,
            embeds: [{
              title: alert.event,
              description: alert.data?.reason,
              color: 0xff0000,
              fields: [
                { name: 'Device ID', value: alert.deviceId?.substring(0, 16) || 'unknown', inline: true },
                { name: 'IP', value: ip || 'unknown', inline: true },
                { name: 'Time', value: new Date().toISOString(), inline: false },
              ],
            }],
          }),
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, alert: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
