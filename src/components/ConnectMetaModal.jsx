import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Helper para construir a URL de autenticação (caso queira abrir popup via JS puro)
 * Mas idealmente usamos a rota do backend /api/meta-auth/login
 */
export const buildMetaAuthURL = (tenantId) => {
    const BASE_URL = 'http://localhost:5000'; // Ajuste conforme env
    return `${BASE_URL}/api/meta-auth/login?tenantId=${tenantId}`;
};

const ConnectMetaModal = ({ isOpen, onClose, tenantId }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConnect = () => {
        setLoading(true);

        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const url = buildMetaAuthURL(tenantId);

        window.open(
            url,
            'Meta Login',
            `width=${width},height=${height},top=${top},left=${left}`
        );

        // O componente pai (Integrations) deve escutar o evento 'message' ou 'storage'
        // para fechar o modal e atualizar o estado.
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Conectar Meta Ads</h3>
                    <p className="text-gray-500 mb-6">
                        Conecte sua conta para importar campanhas, conjuntos de anúncios e métricas de performance automaticamente.
                    </p>

                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="w-full bg-[#1877F2] text-white py-3.5 rounded-xl font-bold hover:bg-[#166fe5] transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Conectando...
                            </>
                        ) : (
                            'Entrar com Facebook (v3)'
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectMetaModal;
