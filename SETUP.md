# GMAPS - Setup Instructions

## Sistema completo de gerenciamento de respostas automáticas do Google Maps com IA

Este documento contém as instruções para configurar o sistema após o deploy.

## 1. Criar o Primeiro Usuário Administrador

Após criar sua primeira conta no sistema, você precisa torná-la administradora. Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Substituir 'seu-email@exemplo.com' pelo email que você cadastrou
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

Ou se você já sabe o ID do seu usuário:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('SEU-USER-ID-AQUI', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## 2. Configurar as API Keys

Após fazer login como administrador:

1. Acesse o menu "Configurações"
2. Configure as seguintes chaves:
   - **OpenAI API Key**: Sua chave de API da OpenAI (sk-...)
   - **Google Client ID**: Client ID do Google OAuth
   - **Google Client Secret**: Client Secret do Google OAuth
3. Clique em "Salvar Configurações"

### Como obter as credenciais:

#### OpenAI API Key
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API key
3. Copie e cole na configuração

#### Google OAuth Credentials
1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto (ou selecione um existente)
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `https://seu-dominio.com/auth/callback`
6. Copie o Client ID e Client Secret

## 3. Funcionalidades do Sistema

### Dashboard
- Visão geral das estatísticas
- Total de empresas cadastradas
- Total de avaliações
- Avaliações respondidas

### Empresas
- Cadastrar novas empresas
- Editar informações
- Conectar com Google Maps
- Ativar/desativar automação de respostas

### Avaliações
- Visualizar todas as avaliações
- Filtrar por empresa e status
- Ver respostas automáticas geradas

### Logs
- Monitorar atividades do sistema
- Filtrar por tipo (info, warning, error)
- Acompanhar erros e sucessos

### Configurações
- Gerenciar API keys de forma segura
- Testar conexões com OpenAI e Google
- Atualizar credenciais a qualquer momento

## 4. Segurança

- Todas as chaves são armazenadas de forma segura no banco de dados
- RLS (Row Level Security) está ativado em todas as tabelas
- Apenas administradores podem acessar configurações do sistema
- Tokens OAuth são armazenados de forma criptografada
- As chaves nunca são enviadas ao frontend

## 5. Autenticação

O sistema suporta:
- Login com email e senha
- Login com Google OAuth
- Cadastro de novos usuários
- Recuperação de senha por email
- Alteração de senha quando logado

## 6. Fluxo de Uso

1. Administrador configura as API keys
2. Cadastra empresas no sistema
3. Conecta empresas ao Google Maps (OAuth)
4. Ativa automação de respostas para cada empresa
5. Sistema busca avaliações automaticamente
6. IA gera respostas profissionais
7. Respostas são publicadas automaticamente

## 7. Edge Functions

O sistema utiliza duas Edge Functions do Supabase:

### generate-response
- Gera respostas automáticas usando OpenAI
- Considera a nota da avaliação (1-5 estrelas)
- Cria respostas profissionais e educadas

### google-oauth-handler
- Gerencia OAuth do Google
- Troca authorization codes por tokens
- Armazena tokens de forma segura

## 8. Suporte

Este sistema foi desenvolvido como um SaaS completo e está pronto para produção após a configuração das chaves de API.

Para adicionar mais funcionalidades ou realizar manutenção, todas as configurações podem ser ajustadas pelo painel administrativo sem necessidade de alterar o código.
