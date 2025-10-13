# Wonderland Trading Bot — Guia de Operação 🐇✨

Este guia resume tudo o que você precisa para levantar o Wonderland Trading Bot localmente, executar as APIs principais e explorar a interface temática.

## 1. Pré-requisitos

1. **Node.js 18+** e **npm** instalados.
2. **MongoDB** em execução localmente (padrão `mongodb://localhost:27017`).
3. Variáveis de ambiente configuradas (crie um arquivo `.env.local` na raiz do projeto):

   ```env
   NEXTAUTH_SECRET="R5HgPQ8zX2vN9mK4jL7tY1wC3bF6uA0n"
   MONGODB_URI="mongodb://localhost:27017/wonder"
   ANKR_API_KEY="<sua_chave_ankr>" # Necessária para as rotinas on-chain do Elixir of Creation
   ```

   > Caso não possua uma chave da Ankr, mantenha a variável sem valor para desativar os fetchs on-chain.

## 2. Instalação

Dentro da pasta do projeto execute:

```bash
npm install
```

## 3. Executando o ambiente de desenvolvimento

```bash
npm run dev
```

O servidor Next.js subirá em `http://localhost:3000`. A interface principal traz o dashboard encantado com cards temáticos, alertas visuais e o painel de orquestração.

## 4. Banco de dados

As rotinas `White Rabbit` e `Drink Me` utilizam a base MongoDB `wonder` com as coleções:

- `glass` — snapshots do Looking Glass (market cap, performances e filtros de preço)
- `drink_me` — tokens detectados recentemente pelo oráculo Drink Me

Certifique-se de que o serviço MongoDB está ativo antes de chamar as APIs.

## 5. APIs principais

### 5.1 White Rabbit

| Endpoint | Descrição |
| --- | --- |
| `GET /api/whiterabbit/pocket_watch` | Busca 15 dias de histórico para o set de moedas principais (CoinGecko) |
| `GET /api/whiterabbit/looking_glass` | Monta o snapshot de mercado e grava em MongoDB (força atualização com `?force=true`) |
| `GET /api/whiterabbit/discover` | Retorna o último snapshot preparado pelo Looking Glass |

### 5.2 Drink Me

| Endpoint | Descrição |
| --- | --- |
| `GET /api/drink_me/fetch` | Lista os tokens analisados nas últimas 24h com filtros opcionais (`network`, `subType`, `scam`, `classificacao`, `hours`, `limit`, `skip`) |

### 5.3 Potions (experimental)

| Endpoint | Descrição |
| --- | --- |
| `GET /api/potions/elixir_of_creation` | Scanner on-chain (ETH/BSC) para mints recentes — requer `ANKR_API_KEY` |

## 6. Orquestrar tudo de uma vez

Acesse `http://localhost:3000/api/runall` para executar o pipeline completo:

1. Pocket Watch coleta o histórico CoinGecko.
2. Looking Glass atualiza o snapshot (força update).
3. Discover retorna o estado consolidado.
4. Drink Me traz as últimas 20 oportunidades.

O endpoint responde com um JSON contendo o status de cada etapa, tempo de execução e resumos dos dados.

Na interface web você pode acionar o mesmo fluxo pelo painel “🚀 Orquestração Completa”, que registra os passos com feedback visual.

## 7. Fluxo de uso sugerido

1. **Rodar `/api/runall`** (ou o botão do painel) para sincronizar dados.
2. **Visitar `http://localhost:3000`** para ver o dashboard temático com cards de mercado, alertas e listas classificadas.
3. **Explorar `http://localhost:3000/drink`** para navegar pelos tokens detectados pelo Drink Me, aplicar filtros e exportar CSV.
4. **Executar `npm run lint`** antes de commitar para garantir o padrão de código.

## 8. Troubleshooting

- **Erros de conexão MongoDB**: confirme o valor de `MONGODB_URI` e se o serviço está ativo.
- **429 no Looking Glass**: o endpoint protege contra atualizações sucessivas em menos de 14 minutos; use `?force=true` ou aguarde o intervalo.
- **APIs externas rate limit**: CoinGecko e Ankr possuem limites; caso receba HTTP 429, tente novamente após alguns minutos.

Bom mergulho em Wonderland! 🫖🐇
