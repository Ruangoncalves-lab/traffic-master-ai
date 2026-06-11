-- 20251205_meta_integration_v2.sql
-- Refatorado para ser 100% não-destrutivo em ambiente de produção

-- Create meta_tokens table if not exists
CREATE TABLE IF NOT EXISTS public.meta_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    access_token TEXT NOT NULL,
    long_lived_token TEXT,
    expires_at TIMESTAMPTZ,
    source TEXT DEFAULT 'user', -- 'user' or 'system_user'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create meta_ad_accounts table if not exists
CREATE TABLE IF NOT EXISTS public.meta_ad_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id TEXT NOT NULL,
    name TEXT,
    currency TEXT,
    business_id TEXT,
    business_name TEXT,
    is_selected BOOLEAN DEFAULT false, -- To mark which account is currently active for the dashboard
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(account_id)
);

-- Create meta_campaigns table if not exists
CREATE TABLE IF NOT EXISTS public.meta_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id TEXT REFERENCES public.meta_ad_accounts(account_id) ON DELETE CASCADE NOT NULL,
    campaign_id TEXT NOT NULL,
    name TEXT,
    status TEXT,
    objective TEXT,
    created_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(campaign_id)
);

-- Create meta_ad_sets table if not exists
CREATE TABLE IF NOT EXISTS public.meta_ad_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id TEXT REFERENCES public.meta_campaigns(campaign_id) ON DELETE CASCADE NOT NULL,
    ad_set_id TEXT NOT NULL,
    name TEXT,
    status TEXT,
    created_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(ad_set_id)
);

-- Create meta_ads table if not exists
CREATE TABLE IF NOT EXISTS public.meta_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ad_set_id TEXT REFERENCES public.meta_ad_sets(ad_set_id) ON DELETE CASCADE NOT NULL,
    ad_id TEXT NOT NULL,
    name TEXT,
    status TEXT,
    creative_id TEXT,
    created_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(ad_id)
);

-- Create meta_metrics table if not exists
CREATE TABLE IF NOT EXISTS public.meta_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id TEXT REFERENCES public.meta_campaigns(campaign_id) ON DELETE CASCADE,
    ad_set_id TEXT REFERENCES public.meta_ad_sets(ad_set_id) ON DELETE CASCADE,
    ad_id TEXT REFERENCES public.meta_ads(ad_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    spend NUMERIC DEFAULT 0,
    cpc NUMERIC DEFAULT 0,
    cpm NUMERIC DEFAULT 0,
    ctr NUMERIC DEFAULT 0,
    roas NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(campaign_id, date)
);

-- --- Migrações de Upgrade Incremental (Preservação de Dados da v1) ---

-- Atualização para meta_tokens
ALTER TABLE public.meta_tokens ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user';

-- Atualização para meta_ad_accounts
ALTER TABLE public.meta_ad_accounts ADD COLUMN IF NOT EXISTS business_id TEXT;
ALTER TABLE public.meta_ad_accounts ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.meta_ad_accounts ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false;

-- Atualização para meta_campaigns
ALTER TABLE public.meta_campaigns ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE public.meta_campaigns ADD COLUMN IF NOT EXISTS created_time TIMESTAMPTZ;

-- Atualização para meta_metrics
ALTER TABLE public.meta_metrics ADD COLUMN IF NOT EXISTS ad_set_id TEXT REFERENCES public.meta_ad_sets(ad_set_id) ON DELETE CASCADE;
ALTER TABLE public.meta_metrics ADD COLUMN IF NOT EXISTS ad_id TEXT REFERENCES public.meta_ads(ad_id) ON DELETE CASCADE;

-- --- Segurança e Políticas (RLS) ---

-- Enable RLS (Seguro mesmo se já estiver ativado)
ALTER TABLE public.meta_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_metrics ENABLE ROW LEVEL SECURITY;

-- Excluir políticas antigas para evitar colisões ao re-executar migrações
DROP POLICY IF EXISTS "Users can manage their own tokens" ON public.meta_tokens;
DROP POLICY IF EXISTS "Users can manage their own ad accounts" ON public.meta_ad_accounts;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.meta_campaigns;
DROP POLICY IF EXISTS "Users can view their own ad sets" ON public.meta_ad_sets;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.meta_ads;
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.meta_metrics;

-- Recriar as políticas atualizadas
CREATE POLICY "Users can manage their own tokens" ON public.meta_tokens
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ad accounts" ON public.meta_ad_accounts
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaigns" ON public.meta_campaigns
    USING (EXISTS (SELECT 1 FROM public.meta_ad_accounts WHERE meta_ad_accounts.account_id = meta_campaigns.account_id AND meta_ad_accounts.user_id = auth.uid()));

CREATE POLICY "Users can view their own ad sets" ON public.meta_ad_sets
    USING (EXISTS (SELECT 1 FROM public.meta_campaigns JOIN public.meta_ad_accounts ON meta_ad_accounts.account_id = meta_campaigns.account_id WHERE meta_campaigns.campaign_id = meta_ad_sets.campaign_id AND meta_ad_accounts.user_id = auth.uid()));

CREATE POLICY "Users can view their own ads" ON public.meta_ads
    USING (EXISTS (SELECT 1 FROM public.meta_ad_sets JOIN public.meta_campaigns ON meta_campaigns.campaign_id = meta_ad_sets.campaign_id JOIN public.meta_ad_accounts ON meta_ad_accounts.account_id = meta_campaigns.account_id WHERE meta_ad_sets.ad_set_id = meta_ads.ad_set_id AND meta_ad_accounts.user_id = auth.uid()));

CREATE POLICY "Users can view their own metrics" ON public.meta_metrics
    USING (EXISTS (SELECT 1 FROM public.meta_campaigns JOIN public.meta_ad_accounts ON meta_ad_accounts.account_id = meta_campaigns.account_id WHERE meta_campaigns.campaign_id = meta_metrics.campaign_id AND meta_ad_accounts.user_id = auth.uid()));
