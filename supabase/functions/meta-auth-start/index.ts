import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const META_APP_ID = Deno.env.get('META_APP_ID')
        const META_REDIRECT_URI = Deno.env.get('META_REDIRECT_URI')
        const META_GRAPH_VERSION = Deno.env.get('META_GRAPH_VERSION') || 'v20.0'

        if (!META_APP_ID || !META_REDIRECT_URI) {
            throw new Error('Missing environment variables: META_APP_ID or META_REDIRECT_URI')
        }

        // Expanded scopes as requested
        const scope = 'ads_management,ads_read,business_management,pages_read_engagement,pages_show_list'
        const authUrl = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${META_REDIRECT_URI}&state=supa_meta_auth&scope=${scope}`

        return new Response(
            JSON.stringify({ url: authUrl }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
