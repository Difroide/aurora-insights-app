# Configuração do Supabase para Aurora Insights

Este guia explica como configurar o Supabase para substituir o armazenamento local do Aurora Insights.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. Node.js e npm instalados

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações:
   - **Name**: `aurora-insights`
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project"

### 2. Configurar Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em **Run** para executar o script

### 3. Configurar Storage

1. No painel do Supabase, vá para **Storage**
2. Verifique se o bucket `media` foi criado automaticamente
3. Se não foi criado, crie manualmente:
   - **Name**: `media`
   - **Public bucket**: ✅ Habilitado

### 4. Obter Credenciais

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public** key

### 5. Configurar Variáveis de Ambiente

1. No seu projeto, copie o arquivo `config.example.env` para `.env.local`:
   ```bash
   cp config.example.env .env.local
   ```

2. Edite o arquivo `.env.local` e adicione suas credenciais:
   ```env
   # Configurações da API PushinPay
   VITE_PIX_API_TOKEN=seu_token_pushinpay_aqui

   # Configurações do Supabase
   VITE_SUPABASE_URL=sua_url_do_supabase_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui

   # Outras configurações
   VITE_APP_NAME=Aurora Insights
   VITE_APP_VERSION=1.0.0
   ```

### 6. Instalar Dependências

```bash
npm install
```

### 7. Executar o Projeto

```bash
npm run dev
```

## 🔐 Configuração de Autenticação

O Supabase Auth já está configurado automaticamente. Os usuários podem:

1. **Cadastrar**: Criar uma nova conta com email e senha
2. **Fazer Login**: Acessar com email e senha
3. **Recuperar Senha**: Solicitar redefinição de senha

### Configurações Adicionais (Opcional)

1. **Email Templates**: Personalize os templates de email em **Authentication** > **Email Templates**
2. **SMTP**: Configure SMTP personalizado em **Authentication** > **Settings**
3. **OAuth**: Adicione provedores OAuth (Google, GitHub, etc.) em **Authentication** > **Providers**

## 🗄️ Estrutura do Banco de Dados

### Tabela `funnels`
- `id`: UUID (chave primária)
- `name`: Nome do funil
- `welcome_message`: Mensagem de boas-vindas
- `media_url`: URL da mídia (opcional)
- `inline_buttons`: Array JSON com botões inline
- `created_at`: Data de criação
- `updated_at`: Data de atualização
- `user_id`: ID do usuário (chave estrangeira)

### Tabela `bots`
- `id`: UUID (chave primária)
- `name`: Nome do bot
- `token`: Token do bot do Telegram
- `funnel_id`: ID do funil associado
- `is_active`: Status ativo/inativo
- `created_at`: Data de criação
- `user_id`: ID do usuário (chave estrangeira)

### Tabela `configs`
- `id`: UUID (chave primária)
- `pix_api_token`: Token da API PushinPay
- `created_at`: Data de criação
- `updated_at`: Data de atualização
- `user_id`: ID do usuário (chave estrangeira, único)

## 🔒 Segurança

### Row Level Security (RLS)
- Todas as tabelas têm RLS habilitado
- Usuários só podem acessar seus próprios dados
- Políticas de segurança configuradas automaticamente

### Storage
- Bucket `media` configurado como público
- Usuários só podem fazer upload em suas próprias pastas
- Arquivos são organizados por `user_id/filename`

## 📊 Monitoramento

### Logs
- Acesse **Logs** no painel do Supabase para ver logs de:
  - Autenticação
  - Banco de dados
  - Storage
  - Edge Functions

### Analytics
- **Dashboard**: Visão geral do projeto
- **Database**: Métricas de performance
- **Auth**: Estatísticas de usuários

## 🚨 Troubleshooting

### Erro de Conexão
```
Error: Missing Supabase environment variables
```
**Solução**: Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configuradas.

### Erro de Permissão
```
Error: new row violates row-level security policy
```
**Solução**: Verifique se o usuário está autenticado e se as políticas RLS estão corretas.

### Erro de Upload
```
Error: new row violates row-level security policy for table "storage.objects"
```
**Solução**: Verifique se o bucket `media` existe e se as políticas de storage estão configuradas.

## 🔄 Migração de Dados

Para migrar dados do localStorage para o Supabase:

1. **Exportar dados locais**:
   ```javascript
   // No console do navegador
   console.log(JSON.stringify({
     funnels: JSON.parse(localStorage.getItem('aurora-funnels') || '[]'),
     bots: JSON.parse(localStorage.getItem('aurora-bots') || '[]'),
     config: JSON.parse(localStorage.getItem('aurora-pushinpay-config') || '{}')
   }));
   ```

2. **Importar no Supabase**:
   - Use o SQL Editor para inserir os dados
   - Ou crie uma função de migração no código

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no painel do Supabase
2. Consulte a documentação oficial
3. Abra uma issue no repositório do projeto
4. Entre em contato com o suporte do Supabase 