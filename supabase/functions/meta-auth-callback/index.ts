import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { code, user_id } = await req.json()

        if (!code || !user_id) {
            throw new Error('Missing code or user_id')
        }

        const META_APP_ID = Deno.env.get('META_APP_ID')
        const META_APP_SECRET = Deno.env.get('META_APP_SECRET')
        const META_REDIRECT_URI = Deno.env.get('META_REDIRECT_URI')
        const META_GRAPH_VERSION = Deno.env.get('META_GRAPH_VERSION') || 'v20.0'
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!META_APP_ID || !META_APP_SECRET || !META_REDIRECT_URI || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing environment variables')
        }

        // 1. Exchange code for short-lived access token
        const tokenUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${META_REDIRECT_URI}&client_secret=${META_APP_SECRET}&code=${code}`

        const tokenRes = await fetch(tokenUrl)
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            throw new Error(`Meta API Error (Token): ${tokenData.error.message}`)
        }

        const shortLivedToken = tokenData.access_token

        // 2. Exchange short-lived token for long-lived token
        const longLivedUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${shortLivedToken}`

        const longLivedRes = await fetch(longLivedUrl)
        const longLivedData = await longLivedRes.json()

        if (longLivedData.error) {
            throw new Error(`Meta API Error (Long Lived): ${longLivedData.error.message}`)
        }

        const longLivedToken = longLivedData.access_token
        const expiresIn = longLivedData.expires_in // Seconds
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // 3. Save to Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        const { error: dbError } = await supabase
            .from('meta_tokens')
            .upsert({
                user_id: user_id,
                access_token: shortLivedToken, // Keeping the initial one just in case, or we can just store the long one
                long_lived_token: longLivedToken,
                expires_at: expiresAt,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (dbError) {
            throw new Error(`Database Error: ${dbError.message}`)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Tokens saved successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
