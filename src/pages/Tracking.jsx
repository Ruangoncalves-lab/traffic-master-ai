import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
    Search,
    Download,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Play,
    Code,
    Sparkles,
    RefreshCw,
    FileSpreadsheet,
    HelpCircle,
    Compass,
    Activity
} from 'lucide-react';

const Tracking = () => {
    const { utmClicks, eventLogs, addUtmClick, addEventLog } = useStore();
    const [activeTab, setActiveTab] = useState('utm');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showSimulationModal, setShowSimulationModal] = useState(false);

    // Formulario de Simulação
    const [simUrl, setSimUrl] = useState('https://seusite.com/oferta?utm_source=facebook&utm_medium=cpc&utm_campaign=black_friday');
    const [simProduct, setSimProduct] = useState('Plano Premium');
    const [simValue, setSimValue] = useState('99.00');

    // Estatísticas UTM
    const totalClicks = utmClicks.length;
    const attributedClicks = utmClicks.filter(c => c.attributed).length;
    const attributionRate = totalClicks ? ((attributedClicks / totalClicks) * 100).toFixed(1) : 0;
    
    // Média de Confiança
    const avgConfidence = totalClicks
        ? (utmClicks.reduce((acc, curr) => acc + curr.confidenceScore, 0) / totalClicks).toFixed(0)
        : 0;

    // Estimativa de Perda (Lost Attribution - Cliques sem UTM que geraram venda ou estimativa baseada em cliques de baixo score)
    const lostAttributionEstimate = utmClicks
        .filter(c => c.confidenceScore < 70)
        .reduce((acc, curr) => acc + (curr.value || 0) * 0.3, 0) // Estimativa de 30% de perda sobre o valor total de campanhas ruins
        .toFixed(2);

    // Estatísticas de Eventos
    const totalEvents = eventLogs.length;
    const successEvents = eventLogs.filter(e => e.status === 'success').length;
    const warningEvents = eventLogs.filter(e => e.status === 'warning').length;
    const errorEvents = eventLogs.filter(e => e.status === 'error').length;

    // Função de exportação de CSV
    const exportCSV = () => {
        const headers = ['ID', 'URL Original', 'Source', 'Medium', 'Campaign', 'Content', 'Atribuído', 'Valor (R$)', 'Confiança (%)', 'Timestamp'];
        const rows = utmClicks.map(c => [
            c.id,
            c.url,
            c.utm_source || '',
            c.utm_medium || '',
            c.utm_campaign || '',
            c.utm_content || '',
            c.attributed ? 'Sim' : 'Não',
            c.value || 0,
            c.confidenceScore,
            c.timestamp
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `trafficpro_utm_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Submissão de Simulação de Clique
    const handleSimulateClick = (e) => {
        e.preventDefault();
        try {
            const urlObj = new URL(simUrl);
            const params = new URLSearchParams(urlObj.search);
            const clickData = {
                url: simUrl,
                utm_source: params.get('utm_source') || '',
                utm_medium: params.get('utm_medium') || '',
                utm_campaign: params.get('utm_campaign') || '',
                utm_content: params.get('utm_content') || '',
                utm_term: params.get('utm_term') || '',
                src: params.get('src') || '',
                product: simProduct,
                value: parseFloat(simValue) || 0
            };
            addUtmClick(clickData);
            
            // Dispara automaticamente um log de evento associado
            addEventLog({
                eventName: clickData.value > 0 ? 'purchase' : 'page_view',
                platform: 'Meta Pixel',
                page: urlObj.pathname || '/oferta',
                status: 'success',
                payload: {
                    url: simUrl,
                    value: clickData.value,
                    utm_source: clickData.utm_source
                }
            });

            setSimUrl('https://seusite.com/oferta?utm_source=facebook&utm_medium=cpc&utm_campaign=black_friday');
            setShowSimulationModal(false);
        } catch (err) {
            alert('Por favor, insira uma URL válida contendo parâmetros de teste.');
        }
    };

    // Simular disparo rápido de evento com erro ou aviso
    const handleSimulateEventOnly = (type) => {
        if (type === 'duplicate') {
            addEventLog({
                eventName: 'purchase',
                platform: 'Meta Pixel',
                page: '/obrigado',
                status: 'warning',
                errorReason: 'Evento Duplicado Detectado',
                payload: { value: 99.00, transaction_id: 'tx_sim_999' }
            });
        } else if (type === 'broken_funnel') {
            addEventLog({
                eventName: 'purchase',
                platform: 'Meta Pixel',
                page: '/obrigado',
                status: 'error',
                errorReason: 'Quebra de Funil: Purchase recebido sem Checkout Start prévio',
                payload: { value: 120.00 }
            });
        } else if (type === 'api_error') {
            addEventLog({
                eventName: 'lead',
                platform: 'Google Tag',
                page: '/contato',
                status: 'error',
                errorReason: 'Falha de Autenticação com a API do Google Ads',
                payload: { email: 'teste@simulado.com' }
            });
        } else {
            addEventLog({
                eventName: 'page_view',
                platform: 'Meta Pixel',
                page: '/home',
                status: 'success',
                payload: { referrer: 'direct', browser: 'Chrome' }
            });
        }
    };

    // Filtros de UTMs
    const filteredClicks = utmClicks.filter(c => {
        const term = searchTerm.toLowerCase();
        return (
            c.url.toLowerCase().includes(term) ||
            (c.utm_source && c.utm_source.toLowerCase().includes(term)) ||
            (c.utm_medium && c.utm_medium.toLowerCase().includes(term)) ||
            (c.utm_campaign && c.utm_campaign.toLowerCase().includes(term))
        );
    });

    const getScoreBadgeColor = (score) => {
        if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (score >= 70) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Compass className="text-emerald-600" size={30} />
                        Rastreamento UTM & Pixels
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Monitore a consistência dos seus links de campanha e audite a integridade dos pixels disparados.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setShowSimulationModal(true)}
                        className="btn-primary bg-emerald-600 text-white hover:bg-emerald-700 border-none shadow-lg shadow-emerald-500/20 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
                    >
                        <Play size={16} />
                        <span>Simular Clique de Campanha</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-6">
                <button
                    onClick={() => setActiveTab('utm')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'utm' ? 'text-emerald-600 font-extrabold' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <Compass size={18} />
                        Explorador UTM
                    </div>
                    {activeTab === 'utm' && (
                        <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'events' ? 'text-emerald-600 font-extrabold' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="flex items-center gap-2">
                        <Activity size={18} />
                        Saúde de Eventos
                    </div>
                    {activeTab === 'events' && (
                        <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                    )}
                </button>
            </div>

            {activeTab === 'utm' ? (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card-premium p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliques de Campanha</div>
                            <div className="text-3xl font-extrabold text-gray-900 mb-1">{totalClicks}</div>
                            <div className="text-xs text-gray-500">Cliques totais com tags registradas</div>
                        </div>
                        <div className="card-premium p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Taxa de Atribuição</div>
                            <div className="text-3xl font-extrabold text-gray-900 mb-1">{attributionRate}%</div>
                            <div className="text-xs text-emerald-600 font-semibold">{attributedClicks} cliques converteram em venda</div>
                        </div>
                        <div className="card-premium p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consistência UTM</div>
                            <div className="text-3xl font-extrabold text-gray-900 mb-1">{avgConfidence}%</div>
                            <div className="text-xs flex items-center gap-1 font-semibold text-amber-600">
                                <Sparkles size={12} />
                                Qualidade média de parametrização
                            </div>
                        </div>
                        <div className="card-premium p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
                            <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Atribuição Perdida (Est.)</div>
                            <div className="text-3xl font-extrabold text-red-700 mb-1">R$ {lostAttributionEstimate}</div>
                            <div className="text-xs text-red-500 font-medium">Devido a UTMs mal configuradas</div>
                        </div>
                    </div>

                    {/* Table Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Filtrar por URL, Source, Campaign..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                            />
                        </div>
                        <button
                            onClick={exportCSV}
                            className="w-full md:w-auto btn-secondary bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                        >
                            <FileSpreadsheet size={16} />
                            <span>Exportar Planilha (CSV)</span>
                        </button>
                    </div>

                    {/* UTM Table */}
                    <div className="card-premium p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table-clean w-full">
                                <thead>
                                    <tr className="bg-gray-50/70 text-left border-b border-gray-100">
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Origem / Canal</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Parâmetros UTM</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Conversão / Valor</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Consistência</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClicks.length > 0 ? (
                                        filteredClicks.map((click) => (
                                            <tr key={click.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm capitalize">{click.utm_source || 'Direto / Orgânico'}</span>
                                                        <span className="text-xs text-gray-400 truncate max-w-xs">{click.url}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                                                        {click.utm_medium && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                                                medium: {click.utm_medium}
                                                            </span>
                                                        )}
                                                        {click.utm_campaign && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                                                campaign: {click.utm_campaign}
                                                            </span>
                                                        )}
                                                        {click.utm_content && (
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                                                                content: {click.utm_content}
                                                            </span>
                                                        )}
                                                        {click.src && (
                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">
                                                                src: {click.src}
                                                            </span>
                                                        )}
                                                        {!click.utm_medium && !click.utm_campaign && (
                                                            <span className="text-xs text-amber-500 font-medium">Sem tags adicionais</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        {click.attributed ? (
                                                            <>
                                                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                                    <CheckCircle2 size={12} /> Atribuído
                                                                </span>
                                                                <span className="text-sm font-semibold text-gray-900">R$ {click.value?.toFixed(2)}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs font-medium">Sem conversão</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`inline-flex items-center justify-center w-14 py-0.5 border text-xs font-extrabold rounded-full ${getScoreBadgeColor(click.confidenceScore)}`}>
                                                            {click.confidenceScore}%
                                                        </span>
                                                        {click.confidenceScore < 100 && (
                                                            <span className="text-[10px] text-amber-600 font-medium max-w-[150px]">
                                                                {click.confidenceScore <= 40 ? 'Faltam tags obrigatórias' : 'Inconsistência de letras maiúsculas'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                                    {new Date(click.timestamp).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                                Nenhum clique de campanha encontrado com os filtros atuais.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Event Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="card-premium p-6">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total de Eventos</div>
                            <div className="text-3xl font-extrabold text-gray-900">{totalEvents}</div>
                        </div>
                        <div className="card-premium p-6 border-emerald-100 bg-emerald-50/20">
                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Sucessos (OK)</div>
                            <div className="text-3xl font-extrabold text-emerald-700">{successEvents}</div>
                        </div>
                        <div className="card-premium p-6 border-yellow-100 bg-yellow-50/20">
                            <div className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Alertas / Avisos</div>
                            <div className="text-3xl font-extrabold text-yellow-700">{warningEvents}</div>
                        </div>
                        <div className="card-premium p-6 border-red-100 bg-red-50/20">
                            <div className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Falhas / Erros</div>
                            <div className="text-3xl font-extrabold text-red-700">{errorEvents}</div>
                        </div>
                    </div>

                    {/* Simulation Panel for Events */}
                    <div className="card-premium p-6 bg-gradient-to-r from-gray-900 to-slate-800 text-white border-none flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Painel de Teste de Integração</h3>
                            <p className="text-xs text-gray-300">Dispare eventos simulados para validar o tratamento de erros e duplicidades da plataforma.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <button
                                onClick={() => handleSimulateEventOnly('success')}
                                className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                            >
                                <Play size={12} /> Page View OK
                            </button>
                            <button
                                onClick={() => handleSimulateEventOnly('duplicate')}
                                className="flex-1 md:flex-initial px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                            >
                                <AlertTriangle size={12} /> Compra Duplicada
                            </button>
                            <button
                                onClick={() => handleSimulateEventOnly('broken_funnel')}
                                className="flex-1 md:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                            >
                                <XCircle size={12} /> Quebra de Funil
                            </button>
                            <button
                                onClick={() => handleSimulateEventOnly('api_error')}
                                className="flex-1 md:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                            >
                                <Code size={12} /> Falha de API
                            </button>
                        </div>
                    </div>

                    {/* Events log list */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Event List (Left, Spans 2 cols) */}
                        <div className="lg:col-span-2 card-premium p-0 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">Logs de Eventos Recebidos</span>
                                <span className="text-xs text-gray-500 font-medium">Ordem cronológica reversa</span>
                            </div>
                            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                                {eventLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        onClick={() => setSelectedEvent(log)}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${selectedEvent?.id === log.id ? 'bg-emerald-50/30' : 'hover:bg-gray-50/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {log.status === 'success' && <CheckCircle2 className="text-emerald-500" size={18} />}
                                            {log.status === 'warning' && <AlertTriangle className="text-yellow-500" size={18} />}
                                            {log.status === 'error' && <XCircle className="text-red-500" size={18} />}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{log.eventName}</span>
                                                <span className="text-xs text-gray-400">{log.platform} • {log.page}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {log.errorReason && (
                                                <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                                                    {log.errorReason}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 font-medium">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Event Details (Right, 1 col) */}
                        <div className="card-premium flex flex-col h-[500px]">
                            <h3 className="font-bold text-gray-950 mb-4 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                                <Code size={16} className="text-emerald-600" />
                                Detalhes do Payload
                            </h3>
                            {selectedEvent ? (
                                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Nome do Evento</span>
                                            <div className="text-sm font-bold text-gray-900">{selectedEvent.eventName}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Plataforma</span>
                                            <div className="text-sm font-medium text-gray-800">{selectedEvent.platform}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Página de Disparo</span>
                                            <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded select-all break-all inline-block mt-0.5">
                                                {selectedEvent.page}
                                            </div>
                                        </div>
                                        {selectedEvent.errorReason && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                                <span className="text-[10px] font-bold text-red-600 uppercase">Motivo do Alerta/Erro</span>
                                                <div className="text-xs font-bold text-red-700 mt-0.5">{selectedEvent.errorReason}</div>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Dados Enviados (JSON)</span>
                                            <pre className="text-xs bg-gray-900 text-emerald-400 p-3 rounded-xl overflow-x-auto font-mono max-h-40">
                                                {JSON.stringify(selectedEvent.payload, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-3 mt-3">
                                        ID Único: {selectedEvent.id}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                                    <HelpCircle size={36} className="mb-2 stroke-1" />
                                    <span className="text-sm font-medium">Selecione um evento da lista para auditar as chaves do payload enviado.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Simulation Modal (Campanha) */}
            <AnimatePresence>
                {showSimulationModal && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg rounded-[2rem] bg-white p-6 md:p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
                                    <Sparkles size={20} className="text-emerald-500" />
                                    Simular Clique de Campanha
                                </h3>
                                <button
                                    onClick={() => setShowSimulationModal(false)}
                                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSimulateClick} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">URL do Anúncio (com UTMs)</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={simUrl}
                                        onChange={(e) => setSimUrl(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-mono transition-all"
                                        placeholder="Cole seu link de afiliado ou campanha aqui"
                                    />
                                    <span className="text-[10px] text-gray-400">Dica: Edite as UTMs na URL para testar a pontuação de qualidade.</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Produto Associado</label>
                                        <input
                                            type="text"
                                            value={simProduct}
                                            onChange={(e) => setSimProduct(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Valor de Venda (Simular Compra)</label>
                                        <input
                                            type="text"
                                            value={simValue}
                                            onChange={(e) => setSimValue(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                                            placeholder="Ex: 99.00 (ou 0 para sem conversão)"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowSimulationModal(false)}
                                        className="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition-all text-sm shadow-lg shadow-emerald-500/10"
                                    >
                                        Disparar Clique
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tracking;
