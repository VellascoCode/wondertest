# 🎩 Checkmate Intelligence

Painel temático inspirado em *Alice no País das Maravilhas* que combina scanners multi-chain, governança de risco e um cockpit visual construído em Next.js.

## ✨ Principais recursos

- Dashboard cinematográfico com layout multi-seção, gradientes animados e placeholders prontos para PNGs temáticos.
- Motor de alertas integrado (`White Rabbit`, `Drink Me`, `Alert Engine`) consumindo MongoDB.
- Autenticação por cookie `.session` assinado (sem coleção de sessões) com verificação em tempo real pelo banco.
- Portal administrativo com controle de status global e gestão de usuários.
- Script de seed para criar administrador padrão e documento de status do sistema.

## 🚀 Primeiros passos

### 1. Dependências

- Node.js 18+
- MongoDB local ou remoto

Crie um arquivo `.env.local` na raiz (os valores abaixo são exemplos):

```env
NEXTAUTH_SECRET="R5HgPQ8zX2vN9mK4jL7tY1wC3bF6uA0n"
MONGODB_URI="mongodb://localhost:27017/wonder"
# Opcional: personalize o admin inicial
SEED_ADMIN_EMAIL="admin@wonder.land"
SEED_ADMIN_PASSWORD="Wonderland#2024"
SEED_ADMIN_NAME="Queen Admin"
```

### 2. Instalação

```bash
npm install
```

### 3. Popular o banco

```bash
npm run seed
```

O script cria (ou garante) o usuário administrador informado nas variáveis `SEED_ADMIN_*` e o documento `system_status` com estado operacional.

### 4. Executar em desenvolvimento

```bash
npm run dev
```

O cockpit ficará disponível em [http://localhost:3000](http://localhost:3000).

## 🔐 Sessões e autenticação

- O login utiliza credenciais armazenadas na coleção `users` (hash `scrypt` com salt aleatório).
- Após autenticação, é emitido um cookie HTTP-only `.session` assinado com `NEXTAUTH_SECRET` contendo apenas e-mail e timestamp.
- Cada chamada à API `/api/auth/session` ou `/api/auth/check` valida a assinatura, consulta o usuário por e-mail e verifica status/tipo em tempo real.
- Usuários banidos (`status === 2`) têm a sessão automaticamente invalidada.

## 🗺️ Estrutura de pastas destacada

```
src/
├─ components/        # Cards, títulos de seção e widgets reutilizáveis
├─ context/           # Providers de autenticação e tema
├─ hooks/             # Hooks para status do sistema e alertas
├─ lib/
│  ├─ auth/           # Serviços de usuário, opções e token da sessão
│  ├─ next-auth/      # Implementação customizada estilo NextAuth
│  └─ systemStatus.ts # Regras de leitura/escrita do status global
├─ pages/
│  ├─ api/            # Rotas REST (alertas, auth, admin, status)
│  ├─ admin/          # Portal administrativo protegido
│  ├─ auth/           # Telas de login/cadastro
│  └─ index.tsx       # Landing page principal temática
└─ utils/             # Utilitários (cookies, formatação, etc.)
```

## 🔌 APIs úteis

| Endpoint | Descrição |
| --- | --- |
| `GET /api/auth/check` | Valida cookie `.session` e retorna usuário/timeline da sessão |
| `POST /api/alerts/run` | Gera alertas simulados (requer admin) |
| `GET /api/system/status` | Estado global do sistema (protegido) |
| `GET /api/whiterabbit/discover` | Último snapshot consolidado do radar |
| `GET /api/runall` | Executa pipeline completo de coleta e análise |

## 🖼️ Interface e direção de arte

A landing foi reconstruída com seções cinematográficas, gradientes dinâmicos e painéis animados via `framer-motion`. No lugar de SVGs genéricos, o projeto agora provê prompts profissionais para geração das artes cartoon/anime — basta seguir `public/illustrations/ART_PROMPTS.md`, exportar os PNGs em alta definição e posicioná-los nas sessões indicadas.

---

Para detalhes adicionais consulte `Guia.md` (setup completo) e `doc.md` (documentação temática estendida).
