import React, { useState, useEffect } from 'react';
import SectionCard from '../components/SectionCard';
import { CheckCircle, XCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import AlertBox from '../components/AlertBox';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Integrations = () => {
    const [loading, setLoading] = useState(true);
    const [metaConnected, setMetaConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('meta_tokens')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setMetaConnected(true);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectMeta = async () => {
        setError(null);
        try {
            const { data, error } = await supabase.functions.invoke('meta-auth-start');
            if (error) throw error;
            if (data?.url) {
                const width = 600;
                const height = 700;
                const left = (window.screen.width - width) / 2;
                const top = (window.screen.height - height) / 2;

                window.open(
                    data.url,
                    'Meta Login',
                    `width=${width},height=${height},top=${top},left=${left}`
                );

                // Listen for success message
                const handleMessage = async (event) => {
                    if (event.data.type === 'META_AUTH_SUCCESS') {
                        window.removeEventListener('message', handleMessage);
                        setSuccess('Conectado com sucesso! Redirecionando para seleção de contas...');
                        setMetaConnected(true);

                        // Redirect to onboarding instead of immediate sync
                        setTimeout(() => {
                            navigate('/meta/onboarding');
                        }, 1500);

                    } else if (event.data.type === 'META_AUTH_ERROR') {
                        window.removeEventListener('message', handleMessage);
                        setError('Erro na autenticação: ' + event.data.error);
                    }
                };
                window.addEventListener('message', handleMessage);
            }
        } catch (err) {
            console.error('Meta Auth Error:', err);
            let msg = err.message;
            if (msg.includes('Failed to send a request')) {
                msg = 'Falha na conexão com o servidor. Verifique se: 1) As Edge Functions foram deployadas. 2) O arquivo .env está correto. 3) Você reiniciou o terminal após editar o .env.';
            }
            setError(msg);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não logado');

            const { data, error } = await supabase.functions.invoke('meta-sync', {
                body: { user_id: user.id }
            });

            if (error) throw error;
            setSuccess('Sincronização concluída com sucesso!');

            // Refresh connection status
            checkConnection();
        } catch (err) {
            console.error('Sync error:', err);
            setError('Erro na sincronização: ' + err.message);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie suas conexões com plataformas externas</p>
                </div>
            </div>

            {error && <AlertBox type="error" message={error} />}
            {success && <AlertBox type="success" message={success} />}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Meta Ads Card */}
                <SectionCard className="hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-4 shadow-sm">
                            📱
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Meta Ads</h3>
                        <p className="text-sm text-gray-500 mb-4">Facebook e Instagram Ads</p>

                        <div className="flex items-center gap-2 mb-4 h-6">
                            {metaConnected ? (
                                <>
                                    <CheckCircle size={16} className="text-green-600" />
                                    <span className="text-sm font-medium text-green-600">Conectado</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-500">Desconectado</span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col items-center w-full mt-4 gap-3">
                            {metaConnected ? (
                                <>
                                    <button
                                        onClick={handleSync}
                                        disabled={syncing}
                                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        {syncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                        Sincronizar Agora
                                    </button>
                                    <button
                                        onClick={() => navigate('/meta/dashboard')}
                                        className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        Ver Dashboard
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleConnectMeta}
                                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                                >
                                    Conectar Meta Ads
                                </button>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* Placeholders for other integrations */}
                <SectionCard className="opacity-60 grayscale">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-4 shadow-sm">
                            🔍
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Google Ads</h3>
                        <p className="text-sm text-gray-500 mb-4">Em breve</p>
                        <button disabled className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                            Indisponível
                        </button>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default Integrations;
