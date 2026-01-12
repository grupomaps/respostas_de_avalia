# GMAPS - Quick Start Guide

## Início Rápido

### 1. Primeiro Acesso

1. Abra o sistema no navegador
2. Clique em "Cadastre-se"
3. Crie sua conta com email e senha
4. Faça login

### 2. Tornar-se Administrador

Após criar sua conta, execute este SQL no Supabase SQL Editor para se tornar administrador:

```sql
-- Substitua 'seu-email@exemplo.com' pelo email que você cadastrou
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'seu-email@exemplo.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Importante**: Faça logout e login novamente para que as permissões de admin sejam aplicadas.

### 3. Configurar API Keys

1. Acesse o menu "Configurações"
2. Configure:
   - **OpenAI API Key**: `sk-...` (obtenha em https://platform.openai.com/api-keys)
   - **Google Client ID**: Configure OAuth em https://console.cloud.google.com/
   - **Google Client Secret**: Da mesma configuração OAuth
3. Clique em "Salvar Configurações"
4. Teste as conexões com os botões "Testar"

### 4. Adicionar Dados de Teste (Opcional)

Execute este SQL para adicionar alguns dados de exemplo:

```sql
-- Inserir empresas de exemplo
INSERT INTO empresas (nome, email_responsavel, google_place_id, automacao_ativa)
VALUES
  ('Restaurante Bella Vista', 'contato@bellavista.com', 'ChIJexample1', true),
  ('Academia FitLife', 'admin@fitlife.com', 'ChIJexample2', false),
  ('Pet Shop Amigo Fiel', 'contato@amigofiel.com', 'ChIJexample3', true);

-- Inserir avaliações de exemplo
INSERT INTO avaliacoes (empresa_id, autor, rating, comentario, respondida, resposta)
SELECT
  e.id,
  'João Silva',
  5,
  'Excelente serviço! Muito profissionais e atenciosos.',
  true,
  'Muito obrigado pelo feedback positivo, João! Ficamos muito felizes em atendê-lo. Esperamos vê-lo novamente em breve!'
FROM empresas e
WHERE e.nome = 'Restaurante Bella Vista'
LIMIT 1;

INSERT INTO avaliacoes (empresa_id, autor, rating, comentario, respondida, resposta)
SELECT
  e.id,
  'Maria Santos',
  4,
  'Ótima academia, só faltam mais equipamentos de musculação.',
  false,
  ''
FROM empresas e
WHERE e.nome = 'Academia FitLife'
LIMIT 1;

INSERT INTO avaliacoes (empresa_id, autor, rating, comentario, respondida, resposta)
SELECT
  e.id,
  'Pedro Oliveira',
  2,
  'Atendimento demorado e preços altos.',
  true,
  'Agradecemos seu feedback, Pedro. Lamentamos que sua experiência não tenha sido satisfatória. Estamos trabalhando para melhorar nosso atendimento e revisar nossos preços. Esperamos poder servi-lo melhor no futuro.'
FROM empresas e
WHERE e.nome = 'Pet Shop Amigo Fiel'
LIMIT 1;

-- Inserir logs de exemplo
INSERT INTO logs (tipo, mensagem)
VALUES
  ('info', 'Sistema iniciado com sucesso'),
  ('info', 'Empresa "Restaurante Bella Vista" cadastrada'),
  ('warning', 'Tentativa de acesso sem permissão'),
  ('error', 'Falha ao conectar com Google API - credenciais não configuradas'),
  ('info', 'Resposta automática gerada para avaliação de João Silva');
```

### 5. Testar o Sistema

#### Dashboard
1. Acesse "Dashboard" no menu
2. Veja as estatísticas:
   - 3 empresas cadastradas
   - 3 avaliações
   - 2 avaliações respondidas

#### Empresas
1. Acesse "Empresas" no menu
2. Veja a lista de empresas
3. Clique em "Nova Empresa" para adicionar
4. Clique no ícone de edição para modificar
5. Observe o status de "Google Conectado" e "Automação"

#### Avaliações
1. Acesse "Avaliações" no menu
2. Veja todas as avaliações
3. Use os filtros:
   - Por empresa
   - Por status (respondida/pendente)
4. Observe as respostas automáticas geradas

#### Logs
1. Acesse "Logs" no menu
2. Veja o histórico de atividades
3. Filtre por tipo (info, warning, error)
4. Clique em "Atualizar" para recarregar

#### Configurações
1. Acesse "Configurações" no menu
2. Veja os campos de API keys
3. Teste as conexões
4. Atualize as credenciais quando necessário

### 6. Gerar Resposta com IA (Teste Manual)

Para testar a geração de respostas com OpenAI:

1. Configure a OpenAI API Key em "Configurações"
2. Use este exemplo de chamada (substitua os valores):

```javascript
// No console do navegador ou em um script
const response = await fetch('https://sua-url-supabase.supabase.co/functions/v1/generate-response', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SUA-ANON-KEY',
  },
  body: JSON.stringify({
    rating: 5,
    comentario: 'Adorei o atendimento!',
    empresa_id: 'uuid-da-empresa'
  })
});

const data = await response.json();
console.log(data.response);
```

### 7. Checklist de Produção

Antes de colocar em produção, verifique:

- [ ] Primeiro usuário administrador criado
- [ ] OpenAI API Key configurada e testada
- [ ] Google OAuth credentials configurados
- [ ] Pelo menos uma empresa cadastrada
- [ ] Sistema de logs funcionando
- [ ] Build executado sem erros
- [ ] Todas as páginas acessíveis
- [ ] Autenticação funcionando (email/senha e Google)

### 8. Recursos Adicionais

- **SETUP.md**: Instruções detalhadas de configuração
- **ARCHITECTURE.md**: Documentação técnica da arquitetura
- **Supabase Dashboard**: https://supabase.com/dashboard
- **OpenAI Platform**: https://platform.openai.com/
- **Google Cloud Console**: https://console.cloud.google.com/

### 9. Solução de Problemas

**Não consigo ver as opções de admin:**
- Verifique se executou o SQL para criar o user_role
- Faça logout e login novamente
- Confirme que o email no SQL está correto

**Erro ao salvar configurações:**
- Verifique se você é admin
- Confirme que está logado
- Verifique o console do navegador para erros

**OpenAI não está funcionando:**
- Confirme que a API key está correta
- Verifique se há créditos na conta OpenAI
- Use o botão "Testar" para validar a conexão

**Google OAuth não funciona:**
- Confirme que as credenciais estão corretas
- Verifique se a URL de callback está configurada no Google Console
- Certifique-se de que a navegação de página inteira está sendo usada

### 10. Próximos Passos

Após a configuração inicial:

1. Cadastre suas empresas reais
2. Configure os Google Place IDs corretos
3. Conecte cada empresa ao Google OAuth
4. Ative a automação de respostas
5. Monitore os logs regularmente
6. Ajuste as respostas da IA conforme necessário

---

**Suporte**: Este sistema é totalmente configurável pelo painel admin. Não é necessário alterar código para a maioria das operações.
