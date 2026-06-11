import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const [status, setStatus] = React.useState('loading');
    const [errorMessage, setErrorMessage] = React.useState(null);

    useEffect(() => {
        const processCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const error = params.get('error');

            if (error) {
                setErrorMessage(params.get('error_description') || 'Erro na autenticação com Meta.');
                setStatus('error');
                if (window.opener) {
                    window.opener.postMessage({ type: 'META_AUTH_ERROR', error }, '*');
                }
                return;
            }

            if (code) {
                try {
                    // Get current user
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        throw new Error('Usuário não autenticado.');
                    }

                    // Call Edge Function to exchange code
                    const { data, error: fnError } = await supabase.functions.invoke('meta-auth-callback', {
                        body: { code, user_id: user.id }
                    });

                    if (fnError) throw fnError;
                    if (data?.error) throw new Error(data.error);

                    setStatus('done');
                    if (window.opener) {
                        window.opener.postMessage({ type: 'META_AUTH_SUCCESS' }, '*');
                        setTimeout(() => window.close(), 1500);
                    }
                } catch (err) {
                    console.error('Callback error:', err);
                    setErrorMessage(err.message || 'Falha ao processar autenticação.');
                    setStatus('error');
                    if (window.opener) {
                        window.opener.postMessage({ type: 'META_AUTH_ERROR', error: err.message }, '*');
                    }
                }
            } else {
                setStatus('error');
                setErrorMessage('Código de autorização não encontrado.');
            }
        };

        processCallback();
    }, []);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
            {status === 'error' ? (
                <div className="text-center">
                    <div className="text-red-500 mb-2 text-xl">⚠️ Erro na autenticação</div>
                    <p className="text-sm text-gray-500 mb-4">{errorMessage}</p>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Fechar Janela
                    </button>
                </div>
            ) : status === 'done' ? (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Conexão realizada com sucesso!</h2>
                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                        A autenticação foi concluída. Esta janela fechará automaticamente.
                    </p>
                </div>
            ) : (
                <>
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900">Autenticando...</h2>
                    <p className="text-gray-500">Trocando tokens com a Meta...</p>
                </>
            )}
        </div>
    );
};

export default AuthCallback;
