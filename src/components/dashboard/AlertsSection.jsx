import React from 'react';
import { AlertTriangle, TrendingDown, AlertCircle } from 'lucide-react';

const AlertsSection = () => {
    const alerts = [
        {
            type: 'warning',
            title: 'Queda no ROAS',
            message: 'A campanha "Verão 2025" teve uma queda de 15% no ROAS nas últimas 24h.',
            icon: TrendingDown,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-100'
        },
        {
            type: 'critical',
            title: 'Orçamento Limitado',
            message: 'A campanha "Remarketing" atingiu 90% do orçamento diário.',
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-100'
        },
        {
            type: 'info',
            title: 'Anúncio Rejeitado',
            message: 'Um criativo da campanha "Lançamento" foi rejeitado pelo Meta Ads.',
            icon: AlertCircle,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-100'
        }
    ];

    return (
        <div className="card-premium p-5 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Alertas e Atenção</h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                {alerts.map((alert, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-2xl border ${alert.bg} ${alert.border}`}>
                        <div className={`p-1.5 rounded-full bg-white/60 ${alert.color}`}>
                            <alert.icon size={18} />
                        </div>
                        <div>
                            <h4 className={`text-sm font-bold ${alert.color} mb-0.5`}>{alert.title}</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">{alert.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsSection;
