# 🎩 Wonderland Trading Bot

> _“Comece pelo começo, continue até chegar ao fim e então pare.”_ – Rei de Copas

## 🧠 Visão Geral

Wonderland Trading Bot é um sistema temático inspirado em *Alice no País das Maravilhas* para análise e alertas de oportunidades no mercado de criptomoedas.

- 🌐 Página única com Next.js
- ⚡ Backend leve em Python
- ☁️ Hospedagem na Vercel
- 🧩 Banco de dados MongoDB (quando necessário)
- 📩 Alertas via Telegram e WhatsApp
- 🎭 Tema narrativo com personagens e eventos mágicos

---

## 🧱 Estrutura do Sistema

| Componente         | Tema                         | Função                                                              |
|--------------------|------------------------------|---------------------------------------------------------------------|
| Frontend           | Espelho de Alice             | Visualização de alertas e dados                                     |
| Backend            | Jardim do Chapeleiro         | APIs para cálculo, verificação e alertas                            |
| Banco de Dados     | Livro de Regras da Rainha    | Armazenamento de usuários, tokens e histórico de alertas           |
| Integrações        | Canhões do Croquet           | WhatsApp (Twilio) + Telegram Bot                                    |

---

## 🔍 Sistemas de Verificação (Personagens)

| Nome               | Personagem                   | Função                                                  |
|--------------------|------------------------------|---------------------------------------------------------|
| WHITE RABBIT       | Coelho Branco 🐇             | Dados em tempo real (WebSocket/API REST)               |
| CHESHIRE CAT       | Gato de Cheshire 😼          | Detecção de SCAM (análise on-chain)                    |
| MAD HATTER         | Chapeleiro Maluco 🎩         | Volatilidade extrema / Padrões de pump/dump            |

## 🚀 Iniciando o Projeto

### Pré-requisitos

- Python 3.8+
- Node.js 14+
- MongoDB

### Frontend (Next.js)

```bash
# Criar novo projeto Next.js
npx create-next-app@latest wonderland-frontend
cd wonderland-frontend

# Instalar dependências
npm install tailwindcss postcss autoprefixer
npm install axios @heroicons/react

# Iniciar servidor de desenvolvimento
npm run dev
```

### Backend (Python)

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

# Instalar dependências
pip install fastapi uvicorn pymongo python-dotenv

# Criar arquivo main.py e iniciar servidor
uvicorn main:app --reload
```

### MongoDB

```bash
# Criar arquivo .env na raiz
MONGODB_URI=mongodb://localhost:27017/wonderland

# Iniciar MongoDB localmente
mongod --dbpath /data/db
```

---
| CATERPILLAR        | Lagarta Azul 🐛              | Análise técnica avançada (Fibonacci, RSI, candles)     |
| DORMOUSE           | Rato Sonolento 🐀            | Tokens adormecidos (breakouts de baixa volatilidade)   |
| MOCK TURTLE        | Tartaruga Fingidora 🐢       | Backtest e estratégias históricas                      |
| DUCHESS            | Duquesa 👑                   | Controle de alavancagem e shorts                       |
| TWEEDLEDEE & DUM   | Gêmeos 👬                    | Verificação redundante (duplo sistema)                 |
| KNAVE OF HEARTS    | Valete de Copas ♠️           | Detecção de manipulação e wash trading                 |

---

## 📢 Alertas Temáticos

| Nome do Alerta     | Tipo de Evento     | Exemplo                         |
|--------------------|-------------------|---------------------------------|
| DRINK_ME           | Novo Token        | 🍷 Token recém-lançado          |
| EAT_ME             | Pump              | 🍰 Subida rápida de preço       |
| GROW_ME            | Compra técnica    | 🌱 RSI baixo + suporte          |
| SHRINK_ME          | Venda técnica     | 🍪 RSI alto + resistência       |
| RABBIT_HOLE        | Scalp             | 🕳️ Volatilidade em minutos     |
| TEA_PARTY          | Acumulação        | 🫖 Smart money ou oversold      |
| QUEENS_ORDER       | Stop global       | ♠️ Perda total excedida         |
| CROQUET_GAME       | Liquidação DeFi   | 🏑 Aave/liquidações massivas    |
| JABBERWOCKY        | Anomalia          | 🐉 Volume/padrões suspeitos     |
| OFF_WITH_HEAD      | Scam extremo      | ⚰️ Scam Score > 90%             |

## 📟 Sistema de Toasts

O sistema de toasts foi reformulado para exibir alertas rápidos no canto superior direito da tela, com base no componente `react-hot-toast`. Os toasts representam alertas efêmeros e são diferentes dos alertas persistentes exibidos na interface principal.

### Regras:

- Máximo de 8 toasts visíveis simultaneamente;
- Cada toast desaparece após 5 segundos;
- Toasts adicionais ficam em fila invisível;
- Cores e bordas seguem o tema de cada personagem/item;
- Ícones visuais substituem emojis, respeitando a identidade visual do projeto.

### Próximos aprimoramentos:

- Animação de entrada e saída refinada;
- Priorização de alertas críticos (ex: `QUEENS_ORDER`);
- Painel de histórico com filtro por tipo, personagem e data.

---

## 🏷️ Badges e Riscos

| Badge             | Cor      | Condição                                                          |
|------------------|----------|--------------------------------------------------------------------|
| SCAM HIGH         | 🔴 Vermelho | Contrato não verificado + liquidez solta + dono com >30% do supply |
| SCAM MEDIUM       | 🟠 Laranja  | Verificado parcialmente, liquidez <50%                           |
| SCAM LOW          | 🟢 Verde    | Verificado, liquidez travada, dono renunciado                   |
| PUMP POTENTIAL    | 🟡 Amarelo | Volume 5x + RSI < 35                                              |
| DUMP WARNING      | 🟣 Roxo    | Queda de 10% + funding negativo                                  |
| SMART MONEY IN    | 🔵 Azul    | Wallets institucionais > $100k                                   |

---

## 📊 Gestão de Risco

| Tier      | Valor        | Alocação     | Risco |
|-----------|--------------|--------------|-------|
| Micro     | $0.50 – $5   | 0.5–2%       | 🔴    |
| Standard  | $1 – $10     | 1–3%         | 🟠    |
| Premium   | $5 – $50     | 2–5%         | 🟢    |

---

## 🛠️ Tecnologias

- **Frontend:** Next.js + TailwindCSS
- **Backend:** Python (APIs Vercel Serverless)
- **Integrações:** Twilio (WhatsApp), Telegram Bot API
- **Banco de Dados:** MongoDB
- **Deploy:** Vercel

---

## 🚧 Roadmap

| Fase | Etapa                                       | Status         |
|------|---------------------------------------------|----------------|
| 1️⃣  | Página inicial com dados                    | ✅ Completo    |
| 2️⃣  | Verificadores iniciais (Rabbit, Caterpillar)| ✅ Completo    |
| 3️⃣  | Alertas com templates                       | ✅ Completo    |
| 4️⃣  | Sistema de toasts com fila e prioridade     | ✅ Implementado |
| 5️⃣  | Login/registro mágico                       | 🔜 Em breve    |
| 6️⃣  | Backtest + painel de histórico              | 🔜 Futuro      |

---

## 💡 Filosofia

**Wonderland prioriza a imersão narrativa e simplicidade funcional.**  
Tudo é temático, organizado por personagens e cenas, e criado para ser divertido, eficiente e memorável.

> _“Porque aqui, veja, é preciso correr o máximo que se pode para ficar no mesmo lugar.”_ – Rainha Vermelha

---