# 🪄 Wonderland Trading Bot — Dossiê Temático

## 🎬 Visão Geral

O Wonderland Trading Bot entrega um ecossistema completo para traders cripto, embrulhado em uma narrativa encantada. A última atualização introduz uma landing page profissional com artes cartoon originais, sessões assinadas por cookie `.session` e um guia operacional unificado.

### Componentes centrais

| Módulo | Codinome | Função |
| --- | --- | --- |
| Cockpit | Espelho de Alice | Dashboard e storytelling visual com animações suaves |
| Motores Quant | White Rabbit / Drink Me | Coleta, curadoria e gravação de dados em MongoDB |
| Governança | Queen of Hearts | Controle de risco, status global e portal admin |
| Orquestração | RunAll | Pipeline único que dispara Pocket Watch → Looking Glass → Drink Me |

## 🧭 Fluxo de Sessão

1. Login via `/auth/signin` com credenciais guardadas na coleção `users` (hash `scrypt`).
2. Em caso de sucesso o backend gera um token assinado (`NEXTAUTH_SECRET`) e grava em um cookie HTTP-only chamado `.session`.
3. APIs sensíveis chamam `getServerSession` ou o endpoint `/api/auth/check`, que:
   - valida assinatura do cookie,
   - busca o usuário por e-mail na base,
   - confirma `status` e `type` em tempo real (desabilitando banidos),
   - devolve um payload enxuto com bandeira `isAdmin`.
4. Logout apenas expira o cookie — nada fica salvo em coleção de sessões.

## 🛠️ Como rodar rápido

```bash
# Dependências
npm install

# Popular base com admin + status global
echo "NEXTAUTH_SECRET=..." > .env.local
cat <<ENV >> .env.local
MONGODB_URI=mongodb://localhost:27017/wonder
SEED_ADMIN_EMAIL=admin@wonder.land
SEED_ADMIN_PASSWORD=Wonderland#2024
ENV

npm run seed
npm run dev
```

Acesse `http://localhost:3000` para o cockpit e `http://localhost:3000/admin` para o painel (após login).

## 📜 Conteúdo da Landing

- **Hero imersivo** com CTA, métricas animadas e card ilustrado.
- **Centro de comando** com `RunAllPanel`, lista de watchers e cards temáticos usando as novas artes `rabbit-oracle.svg`, `queen-guardian.svg` e `alchemist-lab.svg`.
- **Seções temáticas** cobrindo Pulse de Mercado, Alertas Ativos, jornada dos sinais e badges de risco.
- **Integração visual** com framer-motion, degradês multi-cor e brilhos sutis.

## 🔗 APIs em destaque

- `GET /api/runall` — pipeline completo.
- `GET /api/auth/check` — validação centralizada da sessão.
- `POST /api/alerts/run` — geração de alertas mock (admin).
- `GET /api/whiterabbit/discover` — snapshot consolidado para dashboards.

## 📌 Extras documentados

- `Guia.md` — passo a passo atualizado do setup.
- `andamento.md` — status do projeto e próximos passos.
- `doc.md` — lore completo de personagens, fluxos e heurísticas.

> “Siga o coelho branco, mas verifique as métricas antes de saltar.”
