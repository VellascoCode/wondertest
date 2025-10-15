# Andamento Checkmate

## ✅ Concluído
- Landing page reconstruída com layout premium, múltiplas seções animadas, gradientes cinematográficos e cards profissionais.
- Dashboard principal ajustado para exibir cada sessão em tela cheia, removendo divisões 1/2 e grids paralelos indevidos.
- Remoção dos SVGs provisórios e criação de prompts oficiais (`public/illustrations/ART_PROMPTS.md`) para geração dos PNGs anime/cartoon.
- Autenticação revisada: cookie `.session` assinado, checagem centralizada via `/api/auth/check` e remoção da coleção `sessions`.
- Script `npm run seed` garante admin ativo e documento `system_status` com índices prontos para o portal.
- Correção da criação de índices do status global (sem erro `unique` no `_id`).
- Guia (`Guia.md`) e documentação (`README*.md`) atualizados com setup, sessões, fluxo de seed e instruções de direção de arte.

## 🔄 Em andamento
- Homologação completa do fluxo de sessão por cookie (testes cruzados com rotas server-side e APIs protegidas).
- Ampliação do motor de alertas para suportar múltiplas fontes e priorização por tipo.
- Inserção dos PNGs gerados externamente nas sessões (arte aguardando importação).
- Refinamento visual contínuo (tokens de tema fantasia aplicados a componentes externos e formulários do admin).
- Revisão das rotas administrativas para cobrir gaps de validação e monitoramento de integridade dos dados recém migrados.
- Provisionamento de chaves para integrações Moralis Streams, Etherscan/BscScan e CryptoCompare (definir armazenamento em `.env.local` e sincronizar secrets de deploy).

### 🔑 Integrações aguardando aprovação de credenciais
- **Moralis Streams API** – solicitar chave gratuita e configurar `MORALIS_API_KEY`.
- **Etherscan / BscScan APIs** – gerar chaves individuais e mapear variáveis `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`.
- **CryptoCompare API** – validar limite do plano gratuito e definir `CRYPTOCOMPARE_API_KEY`.

## ⏭️ Próximos passos
- Implementar histórico detalhado para o admin (filtros, busca, exportação).
- Integrar notificações em tempo real (WebSocket/Server Sent Events) com canal por usuário.
- Revisar cron para executar em ambiente serverless (ex.: GitHub Actions, Vercel cron jobs).
- Expandir integrações OAuth assim que credenciais externas forem disponibilizadas.
