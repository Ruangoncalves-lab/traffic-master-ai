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

        // 2. Get Selected Ad Accounts for this user
        const { data: accounts, error: accountsError } = await supabase
            .from('meta_ad_accounts')
            .select('account_id')
            .eq('user_id', user_id)
            .eq('is_selected', true)

        if (accountsError) throw accountsError;
        if (!accounts || accounts.length === 0) {
            return new Response(
                JSON.stringify({ success: true, message: 'No selected accounts to sync' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        for (const account of accounts) {
            const actId = `act_${account.account_id}`

            // 3. Fetch Campaigns
            const campaignsUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${actId}/campaigns?fields=id,name,status,objective,created_time&access_token=${accessToken}`
            const campaignsRes = await fetch(campaignsUrl)
            const campaignsData = await campaignsRes.json()
            const campaigns = campaignsData.data || []

            for (const campaign of campaigns) {
                await supabase.from('meta_campaigns').upsert({
                    account_id: account.account_id,
                    campaign_id: campaign.id,
                    name: campaign.name,
                    status: campaign.status,
                    objective: campaign.objective,
                    created_time: campaign.created_time,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'campaign_id' })

                // 4. Fetch Ad Sets
                const adSetsUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${campaign.id}/adsets?fields=id,name,status,created_time&access_token=${accessToken}`
                const adSetsRes = await fetch(adSetsUrl)
                const adSetsData = await adSetsRes.json()
                const adSets = adSetsData.data || []

                for (const adSet of adSets) {
                    await supabase.from('meta_ad_sets').upsert({
                        campaign_id: campaign.id,
                        ad_set_id: adSet.id,
                        name: adSet.name,
                        status: adSet.status,
                        created_time: adSet.created_time,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'ad_set_id' })

                    // 5. Fetch Ads
                    const adsUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${adSet.id}/ads?fields=id,name,status,creative,created_time&access_token=${accessToken}`
                    const adsRes = await fetch(adsUrl)
                    const adsData = await adsRes.json()
                    const ads = adsData.data || []

                    for (const ad of ads) {
                        await supabase.from('meta_ads').upsert({
                            ad_set_id: adSet.id,
                            ad_id: ad.id,
                            name: ad.name,
                            status: ad.status,
                            creative_id: ad.creative?.id,
                            created_time: ad.created_time,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'ad_id' })
                    }
                }

                // 6. Fetch Metrics (Campaign Level for Dashboard)
                const metricsUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${campaign.id}/insights?fields=impressions,clicks,cpc,cpm,ctr,spend,roas&date_preset=last_30d&time_increment=1&access_token=${accessToken}`
                const metricsRes = await fetch(metricsUrl)
                const metricsData = await metricsRes.json()
                const metrics = metricsData.data || []

                for (const metric of metrics) {
                    await supabase.from('meta_metrics').upsert({
                        campaign_id: campaign.id,
                        date: metric.date_start,
                        impressions: metric.impressions,
                        clicks: metric.clicks,
                        ctr: metric.ctr,
                        cpc: metric.cpc,
                        cpm: metric.cpm,
                        roas: metric.roas ? metric.roas[0]?.value : 0,
                        spend: metric.spend
                    }, { onConflict: 'campaign_id,date' })
                }
            }
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Sync completed successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
        )
    }
})
