import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configuração do Supabase (usando as mesmas vars de ambiente do projeto)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const BASE_URL = process.env.SERVER_URL || 'http://localhost:5000';
const REDIRECT_URI = `${BASE_URL}/api/meta-auth/callback`;

/**
 * GET /api/meta-auth/login
 * Gera a URL de login do Facebook e redireciona.
 */
router.get('/login', (req, res) => {
    const { tenantId, userId } = req.query;

    // State para segurança e contexto
    const state = Buffer.from(JSON.stringify({ tenantId, userId })).toString('base64');

    const scopes = [
        'ads_read',
        'ads_management',
        'business_management',
        'read_insights'
    ].join(',');

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=${scopes}`;

    res.redirect(authUrl);
});

/**
 * GET /api/meta-auth/callback
 * Troca o code pelo token, obtém token de longo prazo e salva.
 */
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect(`http://localhost:5173/integrations?error=${error}`);
    }

    if (!code) {
        return res.redirect(`http://localhost:5173/integrations?error=no_code`);
    }

    try {
        // 1. Decodificar State
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        const { tenantId, userId } = decodedState;

        // 2. Trocar Code por Short-Lived Token
        const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
            params: {
                client_id: FB_APP_ID,
                client_secret: FB_APP_SECRET,
                redirect_uri: REDIRECT_URI,
                code
            }
        });

        const shortLivedToken = tokenRes.data.access_token;

        // 3. Trocar por Long-Lived Token
        const longTokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: FB_APP_ID,
                client_secret: FB_APP_SECRET,
                fb_exchange_token: shortLivedToken
            }
        });

        const { access_token: longLivedToken, expires_in } = longTokenRes.data;

        // Calcular data de expiração (aprox 60 dias)
        const expiresAt = new Date(Date.now() + (expires_in * 1000));

        // 4. (Opcional) Buscar dados do usuário do Facebook para salvar nome/id
        const meRes = await axios.get(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${longLivedToken}`);
        const fbUser = meRes.data;

        // 5. Salvar ou Atualizar Conexão no Supabase
        // Nota: A tabela 'connections' precisa ter os campos novos.
        // Se não tiver, o adapter pode falhar se for estrito, mas o Supabase aceita se a coluna existir.

        // Vamos salvar temporariamente na tabela existente, adaptando os campos
        const { data, error: dbError } = await supabase
            .from('connections')
            .upsert({
                tenant_id: tenantId,
                platform: 'meta',
                access_token: longLivedToken, // Usando o campo existente para o token longo
                account_id: fbUser.id, // ID do usuário do FB temporariamente
                status: 'active',
                updated_at: new Date()
                // Campos extras que adicionaremos via SQL:
                // long_lived_token: longLivedToken,
                // expires_at: expiresAt,
                // name: fbUser.name
            }, { onConflict: 'tenant_id, platform' })
            .select();

        if (dbError) throw dbError;

        // 6. Redirecionar com sucesso
        // Passamos o token na URL apenas para o frontend poder listar as contas imediatamente se quiser
        res.redirect(`http://localhost:5173/auth/callback?platform=meta&token=${longLivedToken}&success=true`);

    } catch (err) {
        console.error('Meta Auth Error:', err);
        res.redirect(`http://localhost:5173/auth/callback?error=${encodeURIComponent(err.message)}`);
    }
});

export default router;
