import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, ChevronRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MetaAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase
                .from('meta_ad_accounts')
                .select('*');

            if (error) throw error;
            setAccounts(data);
        } catch (err) {
            console.error('Error fetching accounts:', err);
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Contas de Anúncio</h1>

            <div className="grid gap-4">
                {accounts.map((account) => (
                    <div
                        key={account.id}
                        onClick={() => navigate(`/meta/campaigns/${account.account_id}`)}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{account.name}</h3>
                                <p className="text-sm text-gray-500">ID: {account.account_id} • {account.currency}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                ))}

                {accounts.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Nenhuma conta encontrada. Faça a sincronização na página de Integrações.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetaAccounts;
