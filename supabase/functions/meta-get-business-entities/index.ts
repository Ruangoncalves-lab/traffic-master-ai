import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user_id } = await req.json()

        if (!user_id) {
            throw new Error('Missing user_id')
        }

        const META_GRAPH_VERSION = Deno.env.get('META_GRAPH_VERSION') || 'v20.0'
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Get Token
        const { data: tokenData, error: fetchError } = await supabase
            .from('meta_tokens')
            .select('long_lived_token')
            .eq('user_id', user_id)
            .single()

        if (fetchError || !tokenData) {
            throw new Error('Token not found for user')
        }

        const accessToken = tokenData.long_lived_token

        // 2. Fetch Businesses
        const businessesUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/me/businesses?fields=id,name,picture&access_token=${accessToken}`
        const businessesRes = await fetch(businessesUrl)
        const businessesData = await businessesRes.json()
        const businesses = businessesData.data || []

        // 3. Fetch Ad Accounts (Personal + Business)
        const adAccountsUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/me/adaccounts?fields=account_id,name,currency,business,amount_spent&access_token=${accessToken}`
        const adAccountsRes = await fetch(adAccountsUrl)
        const adAccountsData = await adAccountsRes.json()
        const adAccounts = adAccountsData.data || []

        // 4. Fetch Pages
        const pagesUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/me/accounts?fields=id,name,picture,access_token&access_token=${accessToken}`
        const pagesRes = await fetch(pagesUrl)
        const pagesData = await pagesRes.json()
        const pages = pagesData.data || []

        return new Response(
            JSON.stringify({
                businesses,
                adAccounts,
                pages
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
