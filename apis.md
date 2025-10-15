# Wonderland APIs & Integrações

## Visão Geral
Este documento centraliza os endpoints internos do Wonderland Trading Bot e as integrações externas planejadas. Cada item indica sua finalidade e o estado atual de uso.

### Legenda de status
- **Funcional** – Em uso e validado.
- **Completa** – Entrega finalizada e coberta por documentação/testes.
- **Em andamento** – Implementação ativa.
- **Pendente** – Aguardando priorização ou aprovação.

## Endpoints internos
| Módulo | Endpoint | Descrição | Status |
| --- | --- | --- | --- |
| White Rabbit | `GET /api/whiterabbit/pocket_watch` | Coleta histórico de preço das moedas prioritárias. | Funcional |
| White Rabbit | `GET /api/whiterabbit/looking_glass` | Atualiza o snapshot quantitativo (aceita `?force=true`). | Funcional |
| White Rabbit | `GET /api/whiterabbit/discover` | Retorna o último snapshot consolidado. | Funcional |
| White Rabbit | `GET /api/runall` | Orquestra Pocket Watch, Looking Glass, Discover e Drink Me em sequência. | Funcional |
| Drink Me | `GET /api/drink_me/fetch` | Lista tokens monitorados com filtros de risco. | Funcional |
| Potions | `GET /api/potions/elixir_of_creation` | Scanner on-chain (ETH/BSC) para contratos recém-criados. | Em andamento |
| Alert Engine | `POST /api/alerts/run` | Gatilho manual para gerar alertas mockados/QA. | Funcional |
| Alert Engine | `GET /api/alerts/log` | Consulta os alertas registrados (suporta `limit`, `skip`). | Funcional |
| Alert Engine | `PATCH /api/alerts/resolve` | Finaliza alertas ativos. | Funcional |
| Sistema | `GET /api/system/status` | Recupera status global da plataforma para o gate. | Funcional |
| Sistema | `POST /api/system/status` | Atualiza status, label e mensagem exibidos aos usuários. | Funcional |
| Admin | `GET /api/admin/users` | Lista usuários cadastrados (somente admins). | Funcional |
| Admin | `PATCH /api/admin/users` | Atualiza nível/tipo/estado de usuários (somente admins). | Funcional |
| Auth | `POST /api/auth/register` | Cadastro de novos usuários. | Completa |
| Auth | `POST /api/auth/signin` | Autenticação de credenciais (via NextAuth). | Funcional |

## Integrações externas atuais
| Serviço | Uso previsto | Status |
| --- | --- | --- |
| CoinGecko API | Market data para Pocket Watch e Looking Glass. | Funcional |
| Ankr Advanced API | Scanner on-chain do Elixir of Creation. | Funcional (requer chave) |

## Novas integrações sugeridas
| Serviço | Uso | Plano | Status |
| --- | --- | --- | --- |
| DefiLlama Data API | TVL, liquidez e rankings de protocolos para enriquecer badges e filtros. | Consultas diretas sem autenticação (rate-limit amigável). | Pendente |
| Moralis Streams API | Monitoramento em tempo quase real de eventos on-chain por contrato/token. | Necessita chave gratuita; ideal para ampliar cobertura multi-chain. | Em andamento |
| Etherscan & BscScan APIs | Métricas de contratos (verificação, holders, liquidez) para reforçar SCAM Score. | Requer chaves individuais (free tier). | Em andamento |
| CoinPaprika API | Fonte alternativa de preços/volumes para evitar rate limits de CoinGecko. | Endpoints públicos; implementar fallback no Pocket Watch. | Pendente |
| CryptoCompare API | Histórico OHLC e social data para dashboards e estudos quantitativos. | Free tier com chave; ideal para compor métricas derivadas. | Pendente |

> Para integrações que exigem chave, consulte o `andamento.md` para instruções de provisionamento.
