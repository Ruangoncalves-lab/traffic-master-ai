import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

describe('useStore Zustand Store', () => {
    beforeEach(() => {
        // Resetar o estado da store para garantir isolamento nos testes
        useStore.setState({
            leads: [],
            campaigns: [],
            utmClicks: [],
            eventLogs: []
        });
    });

    it('deve adicionar um lead corretamente', () => {
        const { addLead } = useStore.getState();
        addLead({ name: 'Test Lead', value: '$100', email: 'test@lead.com' });
        
        const state = useStore.getState();
        expect(state.leads).toHaveLength(1);
        expect(state.leads[0].name).toBe('Test Lead');
        expect(state.leads[0].status).toBe('Novo');
        expect(state.leads[0].id).toBeDefined();
    });

    it('deve atualizar o status de um lead corretamente', () => {
        const { addLead, updateLeadStatus } = useStore.getState();
        addLead({ name: 'Status Lead' });
        
        let state = useStore.getState();
        const leadId = state.leads[0].id;
        
        updateLeadStatus(leadId, 'Qualificado');
        
        state = useStore.getState();
        expect(state.leads[0].status).toBe('Qualificado');
    });

    it('deve adicionar uma campanha com valores padrão', () => {
        const { addCampaign } = useStore.getState();
        addCampaign({ name: 'Nova Campanha', budget: '$500' });
        
        const state = useStore.getState();
        expect(state.campaigns).toHaveLength(1);
        expect(state.campaigns[0].name).toBe('Nova Campanha');
        expect(state.campaigns[0].status).toBe('Ativo');
        expect(state.campaigns[0].roi).toBe('0%');
    });

    it('deve adicionar um clique de UTM e calcular o Consistency Score', () => {
        const { addUtmClick } = useStore.getState();
        
        // 1. Clique perfeito (100% de consistência)
        addUtmClick({
            url: 'https://site.com?utm_source=facebook&utm_medium=cpc&utm_campaign=promo',
            utm_source: 'facebook',
            utm_medium: 'cpc',
            utm_campaign: 'promo',
            value: 0
        });

        // 2. Clique inconsistente (capslock e tags faltando)
        addUtmClick({
            url: 'https://site.com?utm_source=GOOGLE',
            utm_source: 'GOOGLE',
            utm_medium: '',
            utm_campaign: '',
            value: 0
        });

        const state = useStore.getState();
        expect(state.utmClicks).toHaveLength(2);
        
        // O primeiro inserido entra no topo (índice 0)
        const badClick = state.utmClicks[0];
        const goodClick = state.utmClicks[1];

        expect(goodClick.confidenceScore).toBe(100);
        // GOOGLE (inconsistente) = -10, falta utm_medium = -30, falta utm_campaign = -20. Score: 100 - 60 = 40.
        expect(badClick.confidenceScore).toBe(40);
    });

    it('deve adicionar um log de evento de pixel corretamente', () => {
        const { addEventLog } = useStore.getState();
        addEventLog({
            eventName: 'page_view',
            platform: 'Meta Pixel',
            page: '/checkout',
            payload: { referrer: 'direct' }
        });

        const state = useStore.getState();
        expect(state.eventLogs).toHaveLength(1);
        expect(state.eventLogs[0].eventName).toBe('page_view');
        expect(state.eventLogs[0].status).toBe('success');
        expect(state.eventLogs[0].id).toBeDefined();
    });
});
