# Andamento Checkmate

## ✅ Concluído
- Layout global atualizado com cabeçalho responsivo, alternância de temas (claro, escuro, fantasia) e rodapé refinado.
- Autenticação básica com cadastro/login, sessão via cookie e portal administrativo com controle de status global e gestão de usuários.
- Páginas de status (manutenção, atualização, acesso restrito) integradas ao gate automático de disponibilidade.
- Motor base de alertas com API, painel de testes (`/alerts-test`) e script `npm run alert-cron` para geração periódica.
- Dashboard reorganizado com cards temáticos, monitor de tokens e visual refinado dos alertas mockados.

## 🔄 Em andamento
- Melhorias nas regras de autorização e unificação com futura adoção do NextAuth oficial.
- Ampliação do motor de alertas para suportar múltiplas fontes e priorização por tipo.
- Design tokens do tema fantasia para cobrir componentes externos (ex.: AlertCard neon).

## ⏭️ Próximos passos
- Persistência em banco (Mongo/Postgres) para usuários, sessões e logs de alertas.
- Implementar histórico detalhado para o admin (filtros, busca, exportação).
- Integrar notificações em tempo real (WebSocket/Server Sent Events) com canal por usuário.
- Revisar cron para executar em ambiente serverless (ex.: GitHub Actions, Vercel cron jobs).
- Completar a migração para NextAuth assim que a dependência puder ser instalada no ambiente.
