# 🚀 Deploy na Railway

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório no GitHub
3. Projeto configurado com Supabase

## 🔧 Passos para Deploy

### 1. Conectar ao GitHub

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Conecte sua conta GitHub
5. Selecione o repositório `aurora-insights`

### 2. Configurar Variáveis de Ambiente

Após o deploy inicial, vá em **"Variables"** e adicione:

```env
# Configurações do Supabase (obrigatórias)
VITE_SUPABASE_URL=https://hllycihdvkcvhxjssevd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbHljaWhkdmtjdmh4anNzZXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc2MzMsImV4cCI6MjA3MDY1MzYzM30.YxvgwgWXUFhzvVBcFoHmdDCdfUjFDr85-uEB1S_3eNk

# Outras configurações (opcionais)
VITE_APP_NAME=Aurora Insights
VITE_APP_VERSION=1.0.0
```

**Nota**: Não é necessário configurar o token da PushinPay aqui, pois cada usuário configura seu próprio token nas configurações da aplicação.

### 3. Configurar Domínio (Opcional)

1. Vá em **"Settings"** > **"Domains"**
2. Clique em **"Generate Domain"** ou configure um domínio customizado

### 4. Verificar Deploy

1. Aguarde o build completar
2. Verifique se o healthcheck passou
3. Acesse a URL gerada

## 🔍 Troubleshooting

### Build Falha
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js 18 está sendo usado

### Healthcheck Falha
- Verifique se a porta 4173 está exposta
- Confirme se o comando `npm run preview` funciona

### Erro de CORS
- Verifique se as variáveis do Supabase estão corretas
- Confirme se o domínio está na whitelist do Supabase

## 📁 Arquivos de Configuração

- `railway.json` - Configuração do Railway
- `.nixpacks.toml` - Build configuration
- `Dockerfile` - Container alternativo
- `public/_redirects` - SPA routing

## 🎯 Status do Deploy

✅ **Configurado para Railway**
✅ **Multi-stage build otimizado**
✅ **Healthcheck configurado**
✅ **Variáveis de ambiente documentadas**
✅ **SPA routing configurado** 