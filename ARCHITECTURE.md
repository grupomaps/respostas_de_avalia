# GMAPS - Arquitetura do Sistema

## Visão Geral

Sistema SaaS completo para gerenciamento de respostas automáticas de avaliações do Google Maps usando Inteligência Artificial.

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth (Email/Senha + Google OAuth)
- **IA**: OpenAI GPT-3.5-turbo
- **Icons**: Lucide React

## Estrutura de Pastas

```
src/
├── components/
│   ├── auth/              # Componentes de autenticação
│   │   ├── AuthContainer.tsx
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── ResetPassword.tsx
│   │   └── ChangePassword.tsx
│   └── layout/            # Componentes de layout
│       └── DashboardLayout.tsx
├── contexts/
│   └── AuthContext.tsx    # Contexto de autenticação
├── lib/
│   └── supabase.ts        # Cliente Supabase + tipos
├── pages/                 # Páginas do sistema
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── Empresas.tsx       # Gerenciamento de empresas
│   ├── Avaliacoes.tsx     # Visualização de avaliações
│   ├── Logs.tsx           # Sistema de logs
│   └── Configuracoes.tsx  # Configurações do sistema
├── App.tsx                # Componente principal
└── main.tsx               # Entry point

supabase/
└── functions/             # Edge Functions
    ├── generate-response/ # Geração de respostas com IA
    └── google-oauth-handler/ # Gestão de OAuth Google
```

## Schema do Banco de Dados

### system_config
Armazena configurações globais do sistema (API keys).
- `id` (uuid, pk)
- `openai_api_key` (text)
- `google_client_id` (text)
- `google_client_secret` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### empresas
Empresas cadastradas no sistema.
- `id` (uuid, pk)
- `nome` (text)
- `email_responsavel` (text)
- `google_place_id` (text)
- `google_conectado` (boolean)
- `access_token` (text)
- `refresh_token` (text)
- `automacao_ativa` (boolean)
- `created_at` (timestamptz)

### avaliacoes
Avaliações do Google Maps.
- `id` (uuid, pk)
- `empresa_id` (uuid, fk → empresas)
- `autor` (text)
- `rating` (integer, 1-5)
- `comentario` (text)
- `respondida` (boolean)
- `resposta` (text)
- `created_at` (timestamptz)

### logs
Logs de atividades do sistema.
- `id` (uuid, pk)
- `tipo` (text: info, warning, error)
- `mensagem` (text)
- `created_at` (timestamptz)

### user_roles
Define permissões de usuários.
- `user_id` (uuid, fk → auth.users)
- `role` (text: admin, user)
- `created_at` (timestamptz)

## Segurança (RLS)

Todas as tabelas possuem Row Level Security (RLS) habilitado.

### Políticas Principais:

**system_config**
- Apenas admins podem visualizar e atualizar

**empresas**
- Apenas admins podem criar, ler, atualizar e deletar

**avaliacoes**
- Apenas admins podem criar, ler, atualizar e deletar

**logs**
- Apenas admins podem visualizar e criar

**user_roles**
- Usuários podem ver apenas sua própria role
- Apenas admins podem gerenciar roles

### Função Helper

`is_admin()`: Verifica se o usuário atual possui role de admin.

## Fluxo de Autenticação

1. Usuário acessa o sistema
2. Se não autenticado, vê AuthContainer (Login/SignUp/Reset)
3. Pode fazer login com:
   - Email/Senha
   - Google OAuth (navegação de página inteira)
4. Após autenticação, AuthContext carrega dados do usuário
5. Sistema verifica role na tabela user_roles
6. Se admin, tem acesso completo ao sistema
7. Se user, acesso limitado (dashboard e alterar senha)

## Edge Functions

### generate-response
**Endpoint**: `/functions/v1/generate-response`

**Input**:
```json
{
  "rating": 5,
  "comentario": "Ótimo atendimento!",
  "empresa_id": "uuid"
}
```

**Output**:
```json
{
  "response": "Muito obrigado pelo feedback positivo..."
}
```

**Funcionamento**:
1. Recebe dados da avaliação
2. Busca OpenAI API key no system_config
3. Envia prompt para OpenAI
4. Retorna resposta gerada
5. Cria log da operação

### google-oauth-handler
**Endpoint**: `/functions/v1/google-oauth-handler`

**Input**:
```json
{
  "empresa_id": "uuid",
  "authorization_code": "code-from-google"
}
```

**Output**:
```json
{
  "success": true
}
```

**Funcionamento**:
1. Recebe código de autorização do Google
2. Busca credenciais OAuth no system_config
3. Troca código por access_token e refresh_token
4. Atualiza empresa com tokens
5. Marca empresa como conectada
6. Cria log da operação

## Componentes Principais

### AuthContext
Gerencia estado de autenticação global.
- Mantém usuário atual
- Carrega role do usuário
- Fornece funções de login/logout/signup
- Gerencia sessão com Supabase

### DashboardLayout
Layout principal da aplicação.
- Sidebar com navegação
- Header com título da página
- Exibe informações do usuário
- Menu responsivo para mobile
- Controla visibilidade de itens por role

### AuthContainer
Gerencia fluxo de autenticação.
- Alterna entre Login/SignUp/Reset
- Gerencia estado de autenticação
- Redireciona após login bem-sucedido

## Páginas

### Dashboard
- Exibe estatísticas do sistema
- Total de empresas, avaliações, etc.
- Cards informativos
- Instruções de uso

### Empresas
- Lista todas empresas cadastradas
- CRUD completo (Create, Read, Update, Delete)
- Modal para criar/editar
- Status de conexão Google
- Status de automação

### Avaliacoes
- Lista todas avaliações
- Filtros por empresa e status
- Exibe rating com estrelas
- Mostra comentário e resposta
- Indicador visual de status

### Logs
- Lista logs do sistema
- Filtro por tipo
- Cores diferentes por tipo
- Timestamp formatado
- Botão de atualização

### Configuracoes
- Formulário para API keys
- Campos tipo password
- Botões de teste para cada serviço
- Mensagens de sucesso/erro
- Salvamento seguro

## Fluxo de Dados

### Criar Empresa
1. Admin preenche formulário
2. Frontend valida dados
3. Envia para Supabase
4. RLS valida permissão
5. Registro criado
6. Lista atualizada

### Gerar Resposta Automática
1. Sistema detecta nova avaliação
2. Verifica se automação está ativa
3. Chama Edge Function generate-response
4. Edge Function busca OpenAI key
5. OpenAI gera resposta
6. Resposta salva no banco
7. Log criado
8. Avaliação marcada como respondida

### Conectar Google OAuth
1. Admin inicia processo OAuth
2. Redirecionado para Google
3. Usuário autoriza
4. Google redireciona com código
5. Frontend chama google-oauth-handler
6. Edge Function troca código por tokens
7. Tokens salvos na empresa
8. Empresa marcada como conectada

## Variáveis de Ambiente

```env
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## Características de Segurança

1. **RLS em todas as tabelas** - Proteção a nível de banco de dados
2. **Função is_admin()** - Verificação centralizada de permissões
3. **API Keys no backend** - Nunca expostas ao frontend
4. **Tokens OAuth seguros** - Armazenados apenas no servidor
5. **Autenticação JWT** - Tokens gerenciados pelo Supabase
6. **CORS configurado** - Apenas origins permitidas
7. **Validação de entrada** - Em todas as Edge Functions

## Próximas Funcionalidades (Sugestões)

- [ ] Automação real de busca de avaliações do Google
- [ ] Sistema de agendamento de respostas
- [ ] Dashboard com gráficos e analytics
- [ ] Notificações por email
- [ ] Relatórios em PDF
- [ ] Multi-idioma
- [ ] Webhooks para eventos
- [ ] API pública com rate limiting
