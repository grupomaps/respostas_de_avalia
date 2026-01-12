# GMAPS - Respostas Automáticas com IA

Sistema SaaS completo para gerenciamento de empresas do Google Maps e resposta automática de avaliações usando Inteligência Artificial.

## Funcionalidades

- Gerenciamento de empresas
- Integração com Google Maps
- Respostas automáticas usando OpenAI
- Sistema de autenticação completo
- Painel administrativo profissional
- Sistema de logs e monitoramento
- Configuração de API keys pelo painel
- Suporte a múltiplas empresas

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth (Email/Senha + Google OAuth)
- **IA**: OpenAI GPT-3.5-turbo
- **Icons**: Lucide React

## Documentação

- [QUICK_START.md](QUICK_START.md) - Guia rápido de início
- [SETUP.md](SETUP.md) - Instruções de configuração
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura técnica do sistema

## Início Rápido

### 1. Criar Conta
Acesse o sistema e crie sua primeira conta.

### 2. Tornar-se Admin
Execute no Supabase SQL Editor:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 3. Configurar API Keys
No painel "Configurações", adicione:
- OpenAI API Key
- Google Client ID
- Google Client Secret

### 4. Começar a usar
- Cadastre empresas
- Conecte ao Google Maps
- Ative automação de respostas
- Monitore avaliações e respostas

## Estrutura do Projeto

```
src/
├── components/
│   ├── auth/              # Autenticação
│   └── layout/            # Layout
├── contexts/              # Contextos React
├── lib/                   # Bibliotecas e utilitários
├── pages/                 # Páginas da aplicação
├── App.tsx
└── main.tsx

supabase/
└── functions/             # Edge Functions
    ├── generate-response/
    └── google-oauth-handler/
```

## Funcionalidades Detalhadas

### Autenticação
- Login com email/senha
- Login com Google OAuth
- Cadastro de usuários
- Recuperação de senha
- Alteração de senha
- Gestão de sessões

### Dashboard
- Estatísticas do sistema
- Total de empresas
- Total de avaliações
- Avaliações respondidas

### Empresas
- CRUD completo
- Status de conexão Google
- Ativação/desativação de automação
- Gestão de Place IDs

### Avaliações
- Visualização de todas avaliações
- Filtros por empresa e status
- Exibição de respostas geradas
- Indicadores visuais de rating

### Logs
- Histórico de atividades
- Filtros por tipo
- Monitoramento de erros
- Tracking de operações

### Configurações
- Gestão de API keys
- Testes de conexão
- Atualização de credenciais
- Segurança robusta

## Segurança

- Row Level Security (RLS) em todas as tabelas
- API keys armazenadas de forma segura
- Tokens OAuth criptografados
- Permissões granulares por role
- Validação em todas as operações

## Build e Deploy

### Desenvolvimento
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Deploy
O sistema está pronto para deploy em plataformas como:
- Vercel
- Netlify
- Render
- Qualquer host que suporte Vite

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## Requisitos

- Node.js 18+
- Conta Supabase
- OpenAI API Key
- Google Cloud Project (para OAuth)

## Contribuindo

Este é um projeto completo e funcional. Para adicionar novas funcionalidades:

1. Mantenha a arquitetura de componentes
2. Siga os padrões de segurança RLS
3. Documente alterações
4. Teste antes de fazer deploy

## Licença

Proprietário

## Suporte

Para questões técnicas ou suporte, consulte a documentação completa nos arquivos:
- QUICK_START.md
- SETUP.md
- ARCHITECTURE.md

---

**Desenvolvido com React + TypeScript + Supabase + OpenAI**
