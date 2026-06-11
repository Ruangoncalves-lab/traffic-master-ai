import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    MousePointerClick,
    MessageCircle,
    Users,
    Eye,
    Video,
    ShoppingBag,
    Filter,
    Download,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { getTenantId } from '../../utils/tenant';

const SmartCampaignsTable = () => {
    const [selectedObjective, setSelectedObjective] = useState('Vendas');
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const objectives = [
        { id: 'Vendas', icon: ShoppingBag, label: 'Vendas', apiObjective: 'OUTCOME_SALES' },
        { id: 'Tráfego', icon: MousePointerClick, label: 'Tráfego', apiObjective: 'OUTCOME_TRAFFIC' },
        { id: 'Engajamento', icon: MessageCircle, label: 'Engajamento', apiObjective: 'OUTCOME_ENGAGEMENT' },
        { id: 'Leads', icon: Users, label: 'Leads', apiObjective: 'OUTCOME_LEADS' },
        { id: 'Mensagens', icon: MessageCircle, label: 'Mensagens', apiObjective: 'OUTCOME_MESSAGES' }, // Often mapped to Engagement or Sales
        { id: 'Alcance', icon: Eye, label: 'Alcance', apiObjective: 'OUTCOME_AWARENESS' },
        { id: 'Video', icon: Video, label: 'Visualização de Vídeo', apiObjective: 'OUTCOME_AWARENESS' },
    ];

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        const tenantId = getTenantId();
        if (!tenantId) return;

        try {
            setLoading(true);
            const res = await fetch(`/api/tenants/${tenantId}/campaigns`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            if (!res.ok) throw new Error('Falha ao carregar campanhas');
            const data = await res.json();
            setCampaigns(data);
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar dados.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    // Helper to format number
    const formatNumber = (value) => {
        return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);
    };

    // Helper to format percent
    const formatPercent = (value) => {
        return `${(value || 0).toFixed(2)}%`;
    };

    const getMetricsForObjective = (campaign, obj) => {
        const m = campaign.performance_summary || {};

        // Default values if metrics are missing
        const defaults = {
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            ctr: 0,
            cpc: 0,
            cpm: 0,
            roas: 0,
            cpa: 0,
            cpl: 0,
            frequency: 0,
            video_views: 0
        };

        const metrics = { ...defaults, ...m };

        // Calculate derived metrics if not present
        const roi = metrics.spend > 0 ? ((metrics.revenue - metrics.spend) / metrics.spend) * 100 : 0;
        const ticket = metrics.conversions > 0 ? metrics.revenue / metrics.conversions : 0;

        switch (obj) {
            case 'Vendas': return {
                roas: metrics.roas.toFixed(2),
                roi: `${roi.toFixed(0)}%`,
                cpa: formatCurrency(metrics.cpa),
                cpc: formatCurrency(metrics.cpc),
                cpm: formatCurrency(metrics.cpm),
                conv: formatNumber(metrics.conversions),
                convValue: formatCurrency(metrics.revenue),
                ticket: formatCurrency(ticket)
            };
            case 'Tráfego': return {
                cpc: formatCurrency(metrics.cpc),
                ctr: formatPercent(metrics.ctr),
                clicks: formatNumber(metrics.clicks),
                cpa: formatCurrency(metrics.cpa),
                impressions: formatNumber(metrics.impressions)
            };
            case 'Engajamento': return {
                totalEng: formatNumber(metrics.post_engagement || 0),
                interactions: formatNumber(metrics.actions?.length || 0), // Simplification
                comments: formatNumber(0), // Need specific metric
                likes: formatNumber(0),
                shares: formatNumber(0)
            };
            case 'Leads': return {
                cpl: formatCurrency(metrics.cpl),
                leads: formatNumber(metrics.leads || metrics.conversions),
                ctr: formatPercent(metrics.ctr),
                quality: 'N/A'
            };
            case 'Mensagens': return {
                costPerMsg: formatCurrency(metrics.cost_per_messaging_conversation_started_7d || 0),
                totalMsg: formatNumber(metrics.messaging_conversations_started_7d || 0),
                responseRate: 'N/A',
                qualified: 'N/A'
            };
            case 'Alcance': return {
                cpm: formatCurrency(metrics.cpm),
                impressions: formatNumber(metrics.impressions),
                reach: formatNumber(metrics.reach || 0),
                frequency: (metrics.frequency || 0).toFixed(2)
            };
            case 'Video': return {
                cpv: formatCurrency(metrics.cost_per_thruplay || 0),
                viewRate: 'N/A',
                retention: 'N/A',
                views: formatNumber(metrics.video_plays || 0)
            };
            default: return {};
        }
    };

    const columns = {
        'Vendas': [
            { label: 'ROAS', key: 'roas', color: 'text-emerald-600 font-bold' },
            { label: 'ROI', key: 'roi', color: 'text-emerald-600' },
            { label: 'CPA', key: 'cpa' },
            { label: 'Conversões', key: 'conv' },
            { label: 'Valor Conv.', key: 'convValue', color: 'font-bold text-gray-900' },
            { label: 'Ticket Médio', key: 'ticket' },
        ],
        'Tráfego': [
            { label: 'CPC', key: 'cpc', color: 'font-bold text-blue-600' },
            { label: 'CTR', key: 'ctr', color: 'text-green-600' },
            { label: 'Cliques', key: 'clicks' },
            { label: 'Impressões', key: 'impressions' },
        ],
        'Engajamento': [
            { label: 'Engajamento', key: 'totalEng', color: 'font-bold text-purple-600' },
            { label: 'Interações', key: 'interactions' },
            { label: 'Curtidas', key: 'likes' },
            { label: 'Comentários', key: 'comments' },
            { label: 'Compart.', key: 'shares' },
        ],
        'Leads': [
            { label: 'CPL', key: 'cpl', color: 'font-bold text-emerald-600' },
            { label: 'Leads', key: 'leads', color: 'font-bold text-gray-900' },
            { label: 'CTR', key: 'ctr' },
            { label: 'Qualidade IA', key: 'quality', badge: true },
        ],
        'Mensagens': [
            { label: 'Custo/Msg', key: 'costPerMsg', color: 'font-bold text-emerald-600' },
            { label: 'Msgs', key: 'totalMsg' },
            { label: 'Resp. %', key: 'responseRate' },
            { label: 'Qualificados', key: 'qualified', color: 'text-green-600' },
        ],
        'Alcance': [
            { label: 'CPM', key: 'cpm', color: 'font-bold text-blue-600' },
            { label: 'Alcance', key: 'reach' },
            { label: 'Impressões', key: 'impressions' },
            { label: 'Frequência', key: 'frequency' },
        ],
        'Video': [
            { label: 'CPV', key: 'cpv', color: 'font-bold text-emerald-600' },
            { label: 'Views', key: 'views' },
            { label: 'Taxa Vis.', key: 'viewRate' },
            { label: 'Retenção', key: 'retention' },
        ],
    };

    // Filter campaigns based on selected objective (optional, or show all but highlight relevant metrics)
    // For now, let's show all campaigns but display metrics relevant to the selected tab
    const currentCampaigns = campaigns.map(c => ({
        ...c,
        metrics: getMetricsForObjective(c, selectedObjective)
    }));

    const currentColumns = columns[selectedObjective];

    if (loading) {
        return (
            <div className="card-premium p-12 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-premium p-6 text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="card-premium p-6 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Campanhas Ativas</h2>
                    <div className="flex gap-2">
                        <button className="btn-secondary px-4 py-2 text-xs">
                            <Filter size={14} /> Filtros
                        </button>
                        <button className="btn-secondary px-4 py-2 text-xs">
                            <Download size={14} /> Exportar
                        </button>
                    </div>
                </div>

                {/* Objective Selector */}
                <div className="flex overflow-x-auto p-1 pb-2 gap-2 no-scrollbar">
                    {objectives.map((obj) => (
                        <button
                            key={obj.id}
                            onClick={() => setSelectedObjective(obj.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${selectedObjective === obj.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-600 ring-offset-2'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <obj.icon size={16} />
                            {obj.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Smart Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">
                                <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                            </th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Campanha</th>
                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            {currentColumns.map((col, idx) => (
                                <th key={idx} className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Orçamento</th>
                            <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {currentCampaigns.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="py-8 text-center text-gray-500">
                                    Nenhuma campanha encontrada.
                                </td>
                            </tr>
                        ) : (
                            currentCampaigns.map((campaign) => (
                                <tr key={campaign._id || campaign.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-4">
                                        <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="font-bold text-gray-900">{campaign.name}</div>
                                        <div className="text-xs text-gray-400">ID: {(campaign.external_id || campaign.id).substring(0, 12)}...</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${campaign.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                            campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    {currentColumns.map((col, idx) => (
                                        <td key={idx} className={`py-4 px-4 text-sm ${col.color || 'text-gray-600'}`}>
                                            {col.badge ? (
                                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold border border-indigo-100">
                                                    {campaign.metrics[col.key]}
                                                </span>
                                            ) : (
                                                campaign.metrics[col.key]
                                            )}
                                        </td>
                                    ))}
                                    <td className="py-4 px-4 font-medium text-gray-900">
                                        {campaign.budget ? (
                                            campaign.budget.amount ? formatCurrency(campaign.budget.amount) : 'N/A'
                                        ) : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Mock) */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div>Mostrando {currentCampaigns.length} campanhas</div>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                    <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Próxima</button>
                </div>
            </div>
        </div>
    );
};

export default SmartCampaignsTable;
