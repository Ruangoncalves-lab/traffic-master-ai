# Guia de Integração Meta Ads (V2)

Este guia descreve a implementação completa da integração com Meta Ads, incluindo fluxo de onboarding, seleção de entidades e sincronização profunda.

## 1. Visão Geral

A integração foi atualizada para suportar:
- **Fluxo de Conexão**: OAuth com permissões expandidas.
- **Onboarding**: Seleção de Business Manager e Ad Accounts.
- **Sincronização**: Campanhas, Ad Sets, Ads e Métricas.
- **Dashboard**: Visualização consolidada.

## 2. Configuração (Supabase)

### 2.1. Variáveis de Ambiente
Configure em `Edge Functions` -> `Secrets`:
- `META_APP_ID`: ID do App.
- `META_APP_SECRET`: Segredo do App.
- `META_REDIRECT_URI`: URL de callback.
- `META_GRAPH_VERSION`: `v20.0`.
- `SUPABASE_URL`: URL do projeto.
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço.

### 2.2. Banco de Dados
Execute o script `supabase/migrations/20251205_meta_integration_v2.sql`.

## 3. Fluxo de Uso

1. **Conectar**: O usuário acessa `/integrations` e clica em "Conectar Meta Ads".
2. **Login**: Redirecionado para o Facebook, autoriza as permissões.
3. **Onboarding**: Após o login, é redirecionado para `/meta/onboarding`.
4. **Seleção**: O sistema busca as contas de anúncio disponíveis. O usuário seleciona quais deseja gerenciar.
5. **Sync Inicial**: Ao confirmar, o sistema salva as contas e dispara o `meta-sync`.
6. **Dashboard**: O usuário é levado para `/meta/dashboard` para ver os dados.

## 4. Edge Functions

- `meta-auth-start`: Inicia OAuth.
- `meta-auth-callback`: Troca tokens e salva.
- `meta-get-business-entities`: Busca Businesses e Ad Accounts do usuário.
- `meta-sync`: Sincroniza dados das contas selecionadas (Campanhas -> Ad Sets -> Ads -> Métricas).
- `meta-refresh-token`: Renova tokens (agendar via Cron).

## 5. Testes

### Teste Manual
1. Vá para `/integrations`.
2. Conecte uma conta.
3. Verifique se foi redirecionado para `/meta/onboarding`.
4. Selecione uma conta e salve.
5. Verifique se os dados aparecem no Dashboard.

### Teste de Sync
Você pode invocar o sync manualmente via cURL:
```bash
curl -i --location --request POST 'https://<project>.supabase.co/functions/v1/meta-sync' \
--header 'Authorization: Bearer <ANON_KEY>' \
--header 'Content-Type: application/json' \
--data '{"user_id": "<USER_UUID>"}'
```

## 6. Manutenção

- **Renovação de Tokens**: Configure um Cron Job no Supabase para rodar `meta-refresh-token` semanalmente.
- **Sync Automático**: Configure um Cron Job para rodar `meta-sync` a cada hora.
