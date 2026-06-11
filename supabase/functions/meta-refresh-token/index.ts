import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Can be triggered by cron or manually
        // If triggered by cron, we might want to iterate all users or a batch.
        // For simplicity, let's assume it accepts a user_id or processes all expiring soon.
        // Let's make it process a specific user_id for now to be callable from frontend or other functions.

        const { user_id } = await req.json()

        if (!user_id) {
            throw new Error('Missing user_id')
        }

        const META_APP_ID = Deno.env.get('META_APP_ID')
        const META_APP_SECRET = Deno.env.get('META_APP_SECRET')
        const META_GRAPH_VERSION = Deno.env.get('META_GRAPH_VERSION') || 'v20.0'
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Get current token
        const { data: tokenData, error: fetchError } = await supabase
            .from('meta_tokens')
            .select('long_lived_token')
            .eq('user_id', user_id)
            .single()

        if (fetchError || !tokenData) {
            throw new Error('Token not found for user')
        }

        const currentToken = tokenData.long_lived_token

        // Refresh token
        const refreshUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${currentToken}`

        const refreshRes = await fetch(refreshUrl)
        const refreshData = await refreshRes.json()

        if (refreshData.error) {
            throw new Error(`Meta API Error: ${refreshData.error.message}`)
        }

        const newLongLivedToken = refreshData.access_token
        const expiresIn = refreshData.expires_in // Seconds
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // Update DB
        const { error: updateError } = await supabase
            .from('meta_tokens')
            .update({
                long_lived_token: newLongLivedToken,
                expires_at: expiresAt,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user_id)

        if (updateError) {
            throw new Error(`Database Update Error: ${updateError.message}`)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Token refreshed successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
