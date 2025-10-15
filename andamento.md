# Andamento Checkmate

## ✅ Concluído
- Layout global atualizado com cabeçalho responsivo, alternância de temas (claro, escuro, fantasia) e rodapé refinado.
- Autenticação via NextAuth com cadastro/login persistido em MongoDB, sessões reais por cookie e portal administrativo com controle de status global e gestão de usuários.
- Páginas de status (manutenção, atualização, acesso restrito) integradas ao gate automático de disponibilidade.
- Motor base de alertas com API, painel de testes (`/alerts-test`) e script `npm run alert-cron` para geração periódica.
- Dashboard reorganizado com cards temáticos, monitor de tokens e visual refinado dos alertas mockados.
- Persistência dos usuários, sessões, status do sistema e logs de alertas em MongoDB com índices e limpeza automática de TTL.

## 🔄 Em andamento
- Homologação do fluxo NextAuth (ajustes de edge cases e testes cruzados com rotas protegidas).
- Ampliação do motor de alertas para suportar múltiplas fontes e priorização por tipo.
- Design tokens do tema fantasia para cobrir componentes externos (ex.: AlertCard neon).
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
- Expandir integrações OAuth no NextAuth assim que as credenciais externas forem disponibilizadas.
