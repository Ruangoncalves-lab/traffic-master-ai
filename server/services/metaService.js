import bizSdk from 'facebook-nodejs-business-sdk';
import axios from 'axios';
import { Campaign, MetricsTimeseries } from '../models/index.js';
import { getInsights } from './meta/getInsights.js';
import { calculateCustomMetrics } from './meta/sync.js';

const AdAccount = bizSdk.AdAccount;
const AdsInsights = bizSdk.AdsInsights;

// ... (Keep CAMPAIGN_FIELDS, ADSET_FIELDS, AD_FIELDS, INSIGHTS_FIELDS as they are useful for other things or just leave them)

export const fetchMetaAdAccounts = async (accessToken) => {
    // ... (Keep existing fetchMetaAdAccounts)
    try {
        console.log('[MetaService] fetchMetaAdAccounts: Init');

        try {
            bizSdk.FacebookAdsApi.init(accessToken);
            const user = new bizSdk.User('me');
            console.log('[MetaService] Fetching accounts via SDK...');

            const accounts = await user.getAdAccounts(['account_id', 'name', 'currency', 'account_status']);
            console.log(`[MetaService] SDK success. Found ${accounts ? accounts.length : 0} accounts.`);

            if (!accounts) return [];

            return accounts.map(acc => ({
                id: `act_${acc.account_id}`,
                name: acc.name,
                currency: acc.currency,
                status: acc.account_status
            }));
        } catch (sdkError) {
            console.warn('[MetaService] SDK failed, trying direct Axios call:', sdkError.message);

            // Fallback to direct API call
            const url = `https://graph.facebook.com/v18.0/me/adaccounts`;
            const res = await axios.get(url, {
                params: {
                    access_token: accessToken,
                    fields: 'account_id,name,currency,account_status',
                    limit: 100
                }
            });

            console.log('[MetaService] Axios success');
            const data = res.data ? res.data.data : [];

            if (!Array.isArray(data)) {
                console.error('[MetaService] Unexpected data format from Axios:', res.data);
                return [];
            }

            return data.map(acc => ({
                id: `act_${acc.account_id}`,
                name: acc.name,
                currency: acc.currency,
                status: acc.account_status
            }));
        }
    } catch (error) {
        console.error('[MetaService] Error fetching Meta Ad Accounts:', error.response?.data || error.message);
        const msg = error.response?.data?.error?.message || error.message || 'Failed to fetch ad accounts';
        throw new Error(msg);
    }
};

export const fetchMetaPixels = async (accessToken, accountId) => {
    // ... (Keep existing fetchMetaPixels)
    try {
        bizSdk.FacebookAdsApi.init(accessToken);
        const account = new AdAccount(accountId);
        const pixels = await account.getAdsPixels(['id', 'name', 'code']);

        return pixels.map(p => ({
            id: p.id,
            name: p.name
        }));
    } catch (error) {
        console.error('Error fetching Meta Pixels:', error);
        // Pixels might fail if permissions are missing, return empty array gracefully
        return [];
    }
};

export const syncMetaAccount = async (connection) => {
    const { access_token, account_id, tenant_id } = connection;

    // Initialize SDK
    bizSdk.FacebookAdsApi.init(access_token);
    const account = new AdAccount(account_id);

    console.log(`Syncing Meta Account: ${account_id} for Tenant: ${tenant_id}`);

    try {
        // 1. Sync Campaigns
        const campaigns = await account.getCampaigns(['id', 'name', 'status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time']);

        for (const metaCampaign of campaigns) {
            await Campaign.findOneAndUpdate(
                { external_id: metaCampaign.id, tenant_id },
                {
                    name: metaCampaign.name,
                    platform: 'meta',
                    status: mapStatus(metaCampaign.status),
                    objective: metaCampaign.objective,
                    budget: {
                        amount: metaCampaign.daily_budget || metaCampaign.lifetime_budget,
                        type: metaCampaign.daily_budget ? 'DAILY' : 'LIFETIME'
                    },
                    updated_at: new Date()
                },
                { upsert: true, new: true }
            );
        }

        // 2. Sync AdSets (Optional: Store in separate collection if needed, for now just logging count)
        const adsets = await account.getAdSets(['id', 'name', 'status']);
        // TODO: Save AdSets to DB if model exists

        // 3. Sync Ads (Optional: Store in separate collection if needed)
        const ads = await account.getAds(['id', 'name', 'status']);
        // TODO: Save Ads to DB if model exists

        // 4. Sync Insights (Campaign Level) - Maximum for comprehensive data
        const insightsList = await getInsights({
            accountId: account_id,
            token: access_token,
            date_range: 'maximum',
            level: 'campaign',
            returnArray: true
        });

        console.log(`[Meta Sync] Fetched insights for ${insightsList.length} campaigns.`);

        for (const stat of insightsList) {
            // Calculate custom metrics (Profit, ROI, ROAS, etc.)
            const customMetrics = calculateCustomMetrics(stat);

            // Merge normalized metrics with custom metrics
            const fullMetrics = { ...stat, ...customMetrics };

            // Extract campaign ID from raw data (since getInsights normalizes it away)
            const campaignId = stat._raw ? stat._raw.campaign_id : null;

            if (!campaignId) {
                console.warn('[Meta Sync] Warning: No campaign_id found in insights data', stat);
                continue;
            }

            // Save to Timeseries
            await MetricsTimeseries.create({
                tenant_id,
                entity_type: 'campaign',
                entity_id: campaignId, // External ID
                platform: 'meta',
                date: new Date(), // Now
                granularity: 'day',
                metrics: fullMetrics
            });

            // Update Campaign Performance Summary Cache
            await Campaign.findOneAndUpdate(
                { external_id: campaignId, tenant_id },
                {
                    performance_summary: fullMetrics
                }
            );
        }

        return {
            success: true,
            campaigns: campaigns.length,
            adsets: adsets.length,
            ads: ads.length,
            insights: insightsList.length
        };

    } catch (error) {
        console.error('Meta Sync Error:', error);
        throw error;
    }
};

const mapStatus = (metaStatus) => {
    const map = {
        'ACTIVE': 'ACTIVE',
        'PAUSED': 'PAUSED',
        'ARCHIVED': 'ARCHIVED',
        'DELETED': 'ARCHIVED',
        'IN_PROCESS': 'PENDING',
        'WITH_ISSUES': 'ERROR'
    };
    return map[metaStatus] || metaStatus;
};

export const createMetaCampaign = async (connection, campaignData) => {
    const { access_token, account_id } = connection;
    bizSdk.FacebookAdsApi.init(access_token);
    const account = new AdAccount(account_id);

    try {
        const createdCampaign = await account.createCampaign([], {
            name: campaignData.name,
            objective: campaignData.objective, // e.g., OUTCOME_TRAFFIC, OUTCOME_SALES
            status: 'PAUSED', // Always create paused for safety
            special_ad_categories: [], // Handle if needed
            daily_budget: campaignData.budget.type === 'DAILY' ? campaignData.budget.amount : undefined,
            lifetime_budget: campaignData.budget.type === 'LIFETIME' ? campaignData.budget.amount : undefined,
        });

        return {
            id: createdCampaign.id,
            name: campaignData.name,
            status: 'PAUSED'
        };
    } catch (error) {
        console.error('Error creating Meta Campaign:', error);
        throw new Error('Failed to create campaign on Meta: ' + error.message);
    }
};
