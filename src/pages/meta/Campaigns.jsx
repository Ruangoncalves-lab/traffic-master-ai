import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ArrowLeft, Activity, PauseCircle, PlayCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const MetaCampaigns = () => {
    const { id: accountId } = useParams();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCampaigns();
    }, [accountId]);

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase
                .from('meta_campaigns')
                .select('*')
                .eq('account_id', accountId);

            if (error) throw error;
            setCampaigns(data);
        } catch (err) {
            console.error('Error fetching campaigns:', err);
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
        <div className="p-6 max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/meta/accounts')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar para Contas
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">Campanhas</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Nome</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-sm">ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {campaigns.map((campaign) => (
                            <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{campaign.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${campaign.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {campaign.status === 'ACTIVE' ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                                        {campaign.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                    {campaign.campaign_id}
                                </td>
                            </tr>
                        ))}
                        {campaigns.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                    Nenhuma campanha encontrada nesta conta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MetaCampaigns;
