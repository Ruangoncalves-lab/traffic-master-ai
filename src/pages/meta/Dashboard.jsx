import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Loader2, TrendingUp, DollarSign, MousePointer, Eye } from 'lucide-react';
import SectionCard from '../../components/SectionCard';

const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
);

const MetaDashboard = () => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({ spend: 0, impressions: 0, clicks: 0, ctr: 0 });

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch all metrics for user's campaigns
            // We need to join with campaigns -> accounts -> user
            // But Supabase JS client doesn't support deep joins easily without views or complex queries.
            // Let's use the RLS policies to our advantage: we can only see our own metrics.
            // So we can just select * from meta_metrics.

            const { data, error } = await supabase
                .from('meta_metrics')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;

            setMetrics(data);

            // Calculate summary
            const sum = data.reduce((acc, curr) => ({
                spend: acc.spend + (Number(curr.spend) || 0),
                impressions: acc.impressions + (Number(curr.impressions) || 0),
                clicks: acc.clicks + (Number(curr.clicks) || 0),
            }), { spend: 0, impressions: 0, clicks: 0 });

            setSummary({
                ...sum,
                ctr: sum.impressions ? ((sum.clicks / sum.impressions) * 100).toFixed(2) : 0
            });

        } catch (err) {
            console.error('Error fetching metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Meta Ads Dashboard</h1>
                <span className="text-sm text-gray-500">Últimos 30 dias</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Investimento"
                    value={`R$ ${summary.spend.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <MetricCard
                    title="Impressões"
                    value={summary.impressions.toLocaleString()}
                    icon={Eye}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="Cliques"
                    value={summary.clicks.toLocaleString()}
                    icon={MousePointer}
                    color="bg-purple-500"
                />
                <MetricCard
                    title="CTR Médio"
                    value={`${summary.ctr}%`}
                    icon={TrendingUp}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Evolução de Investimento">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                                <YAxis />
                                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                                <Bar dataKey="spend" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Performance (CTR)">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                                <YAxis />
                                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                <Line type="monotone" dataKey="ctr" stroke="#6366F1" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default MetaDashboard;
