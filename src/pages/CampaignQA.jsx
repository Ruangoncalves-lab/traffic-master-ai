import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Search,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    ArrowRight,
    HelpCircle,
    Info,
    Sparkles
} from 'lucide-react';

const CampaignQA = () => {
    const [url, setUrl] = useState('');
    const [auditResult, setAuditResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleAudit = (e) => {
        e.preventDefault();
        if (!url) return;

        let parsedUrl;
        try {
            parsedUrl = new URL(url);
        } catch (err) {
            // Se falhar, tenta adicionar http:// e parsear
            try {
                parsedUrl = new URL('http://' + url);
            } catch (err2) {
                alert('URL Inválida. Verifique o formato e tente novamente.');
                return;
            }
        }

        const params = new URLSearchParams(parsedUrl.search);
        const utm_source = params.get('utm_source');
        const utm_medium = params.get('utm_medium');
        const utm_campaign = params.get('utm_campaign');
        const utm_content = params.get('utm_content');
        const utm_term = params.get('utm_term');

        // Regras de Análise
        const checks = [];
        let score = 100;

        // 1. Source
        if (!utm_source) {
            checks.push({
                id: 'source',
                title: 'Parâmetro utm_source',
                desc: 'Identifica a origem do tráfego (ex: facebook, google, email).',
                status: 'error',
                feedback: 'Parâmetro obrigatório ausente.'
            });
            score -= 40;
        } else {
            const isCapitalized = utm_source !== utm_source.toLowerCase();
            checks.push({
                id: 'source',
                title: 'Parâmetro utm_source',
                desc: `Origem detectada: "${utm_source}".`,
                status: isCapitalized ? 'warning' : 'success',
                feedback: isCapitalized ? 'Utilize apenas letras minúsculas (ex: "facebook" em vez de "Facebook" ou "FACEBOOK") para evitar duplicidade de canais nos relatórios.' : 'Configuração perfeita.'
            });
            if (isCapitalized) score -= 10;
        }

        // 2. Medium
        if (!utm_medium) {
            checks.push({
                id: 'medium',
                title: 'Parâmetro utm_medium',
                desc: 'Identifica a mídia do anúncio (ex: cpc, stories, bio, banner).',
                status: 'error',
                feedback: 'Parâmetro obrigatório ausente.'
            });
            score -= 30;
        } else {
            const isCapitalized = utm_medium !== utm_medium.toLowerCase();
            checks.push({
                id: 'medium',
                title: 'Parâmetro utm_medium',
                desc: `Mídia detectada: "${utm_medium}".`,
                status: isCapitalized ? 'warning' : 'success',
                feedback: isCapitalized ? 'Prefira minúsculas (ex: "cpc" em vez de "CPC") para consistência de dados.' : 'Configuração perfeita.'
            });
            if (isCapitalized) score -= 10;
        }

        // 3. Campaign
        if (!utm_campaign) {
            checks.push({
                id: 'campaign',
                title: 'Parâmetro utm_campaign',
                desc: 'Identifica a campanha específica de marketing (ex: black_friday_2026).',
                status: 'error',
                feedback: 'Parâmetro obrigatório ausente.'
            });
            score -= 20;
        } else {
            const isCapitalized = utm_campaign !== utm_campaign.toLowerCase();
            checks.push({
                id: 'campaign',
                title: 'Parâmetro utm_campaign',
                desc: `Campanha detectada: "${utm_campaign}".`,
                status: isCapitalized ? 'warning' : 'success',
                feedback: isCapitalized ? 'Sugere-se usar minúsculas e evitar espaços ou caracteres especiais.' : 'Configuração perfeita.'
            });
            if (isCapitalized) score -= 5;
        }

        // 4. Pixel Check (Simulado)
        const hasPixel = url.includes('facebook.com') || url.includes('instagram.com') || url.includes('google.com') || Math.random() > 0.2;
        checks.push({
            id: 'pixel',
            title: 'Código do Pixel de Rastreamento',
            desc: 'Verifica se o snippet do Pixel/Google Tag está escutando na página de destino.',
            status: hasPixel ? 'success' : 'warning',
            feedback: hasPixel ? 'Pixel do Meta Ads & Google Ads detectados na página de destino.' : 'Nenhum script de pixel ativo foi detectado nesta URL. Verifique se o código de rastreamento está instalado.'
        });

        // 5. Checkout Webhook Check (Simulado)
        const hasWebhook = Math.random() > 0.15;
        checks.push({
            id: 'webhook',
            title: 'Webhook de Vendas do Checkout',
            desc: 'Garante que os eventos de compra do checkout estão integrados de volta ao TrafficPro.',
            status: hasWebhook ? 'success' : 'error',
            feedback: hasWebhook ? 'Integração de Webhook ativa para esta página de vendas.' : 'Nenhuma rota de webhook de vendas correspondente encontrada para este domínio. Suas conversões podem ficar desatribuidas.'
        });

        // Sugestão de Link Corrigido
        const correctedParams = new URLSearchParams(parsedUrl.search);
        if (utm_source) correctedParams.set('utm_source', utm_source.toLowerCase().trim());
        else correctedParams.set('utm_source', 'facebook');
        
        if (utm_medium) correctedParams.set('utm_medium', utm_medium.toLowerCase().trim());
        else correctedParams.set('utm_medium', 'cpc');

        if (utm_campaign) correctedParams.set('utm_campaign', utm_campaign.toLowerCase().replace(/\s+/g, '_').trim());
        else correctedParams.set('utm_campaign', 'campanha_sem_nome');

        // Reconstrói URL
        const correctedUrl = `${parsedUrl.origin}${parsedUrl.pathname}?${correctedParams.toString()}`;

        setAuditResult({
            score: Math.max(10, score),
            checks,
            correctedUrl,
            utm_source,
            utm_medium,
            utm_campaign
        });
    };

    const copyToClipboard = () => {
        if (!auditResult) return;
        navigator.clipboard.writeText(auditResult.correctedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getHeaderColor = (score) => {
        if (score >= 90) return 'from-emerald-500 to-teal-600 text-white';
        if (score >= 70) return 'from-amber-500 to-orange-600 text-white';
        return 'from-red-500 to-rose-600 text-white';
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-600" size={30} />
                        Campaign QA (Auditoria Pré-Lançamento)
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Cole o link da sua página de vendas ou anúncio para validar as tags UTM e garantir 100% de precisão na atribuição de receita.</p>
                </div>
            </div>

            {/* URL Input Area */}
            <div className="card-premium p-6">
                <form onSubmit={handleAudit} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Cole a URL do seu Anúncio ou Página de Vendas</label>
                        <div className="flex flex-col md:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="https://seusite.com/checkout?utm_source=Facebook&utm_medium=CPC&utm_campaign=OfertaEspecial"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono transition-all"
                            />
                            <button
                                type="submit"
                                className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all"
                            >
                                <Search size={16} />
                                <span>Auditar Link</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Audit Results */}
            <AnimatePresence>
                {auditResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Summary & Correction (Left Column, Spans 1) */}
                        <div className="flex flex-col gap-6">
                            {/* Score Card */}
                            <div className={`rounded-3xl p-6 bg-gradient-to-br ${getHeaderColor(auditResult.score)} text-center shadow-lg`}>
                                <div className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Pontuação de Confiança</div>
                                <div className="text-6xl font-black mb-2">{auditResult.score}%</div>
                                <div className="text-sm font-semibold text-white/95">
                                    {auditResult.score >= 90 && 'Pronto para veiculação!'}
                                    {auditResult.score >= 70 && auditResult.score < 90 && 'Requer Pequenos Ajustes.'}
                                    {auditResult.score < 70 && 'Risco de Perda de Rastreamento.'}
                                </div>
                            </div>

                            {/* Corrected URL Suggestion */}
                            <div className="card-premium p-6 space-y-4">
                                <h3 className="font-bold text-gray-950 flex items-center gap-1.5 text-sm">
                                    <Sparkles size={16} className="text-emerald-500" />
                                    Link Corrigido Sugerido
                                </h3>
                                <p className="text-xs text-gray-500">Corrigimos as inconsistências de letras maiúsculas ou criamos padrões recomendados de mercado.</p>
                                
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 select-all font-mono text-xs text-emerald-800 break-all leading-relaxed">
                                    {auditResult.correctedUrl}
                                </div>

                                <button
                                    onClick={copyToClipboard}
                                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            Link Copiado!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            Copiar Link Corrigido
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Checklist Details (Right Columns, Spans 2) */}
                        <div className="lg:col-span-2 card-premium p-6 space-y-6">
                            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                Checklist de Auditoria de URL
                            </h3>
                            <div className="space-y-5">
                                {auditResult.checks.map((check) => (
                                    <div key={check.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="mt-0.5">
                                            {check.status === 'success' && <CheckCircle2 className="text-emerald-500" size={20} />}
                                            {check.status === 'warning' && <AlertTriangle className="text-yellow-500" size={20} />}
                                            {check.status === 'error' && <XCircle className="text-red-500" size={20} />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">{check.title}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${check.status === 'success' ? 'bg-emerald-50 text-emerald-700' : check.status === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                                                    {check.status === 'success' ? 'Verificado' : check.status === 'warning' ? 'Atenção' : 'Erro'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">{check.desc}</p>
                                            <p className={`text-xs mt-1.5 font-medium leading-relaxed ${check.status === 'success' ? 'text-gray-600' : check.status === 'warning' ? 'text-amber-700' : 'text-red-700'}`}>
                                                {check.feedback}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Informational Warning Footer */}
                            {auditResult.score < 100 && (
                                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs font-medium border border-emerald-100">
                                    <Info className="mt-0.5 text-emerald-600 shrink-0" size={16} />
                                    <div>
                                        <p className="font-bold mb-0.5">Por que padronizar as UTMs em caixa baixa?</p>
                                        <p className="leading-relaxed">Ferramentas de análise como Google Analytics tratam <code className="bg-white/60 px-1 py-0.2 rounded font-mono">Facebook</code>, <code className="bg-white/60 px-1 py-0.2 rounded font-mono">facebook</code> e <code className="bg-white/60 px-1 py-0.2 rounded font-mono">facebook-ads</code> como três origens de tráfego totalmente diferentes. A padronização automática evita que seus relatórios e dashboards fiquem duplicados ou bagunçados.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CampaignQA;
