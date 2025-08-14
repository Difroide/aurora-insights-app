# 🆕 Criar Novo Repositório GitHub

## 📋 Passos para criar o repositório:

### 1. Acesse o GitHub
- Vá para: https://github.com/new
- Faça login na sua conta GitHub

### 2. Configure o repositório
- **Repository name**: `aurora` (ou `aurora-insights`)
- **Description**: `Aurora Insights - Sistema de Funnels e Bots do Telegram`
- **Visibility**: 
  - ✅ **Public** (recomendado para Railway)
  - ❌ Private (se quiser manter privado)
- **NÃO** marque "Add a README file"
- **NÃO** marque "Add .gitignore"
- **NÃO** marque "Choose a license"

### 3. Clique em "Create repository"

### 4. No terminal, execute os comandos:

```bash
# Verificar se o remote está correto
git remote -v

# Se não estiver, adicionar o remote correto
git remote add origin https://github.com/SEU_USUARIO/aurora.git

# Fazer push do código
git push -u origin main
```

### 5. Verificar se funcionou
- Vá para: https://github.com/SEU_USUARIO/aurora
- Deve mostrar todos os arquivos do projeto

## 🚀 Depois do repositório criado:

### 1. No Railway:
- Acesse: https://railway.app/dashboard
- **"New Project"** → **"Deploy from GitHub repo"**
- Conecte GitHub e selecione o repositório `aurora`

### 2. Configurar variáveis:
```env
VITE_SUPABASE_URL=https://hllycihdvkcvhxjssevd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbHljaWhkdmtjdmh4anNzZXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc2MzMsImV4cCI6MjA3MDY1MzYzM30.YxvgwgWXUFhzvVBcFoHmdDCdfUjFDr85-uEB1S_3eNk
VITE_APP_NAME=Aurora Insights
VITE_APP_VERSION=1.0.0
```

## ✅ Status atual:
- ✅ Código pronto para deploy
- ✅ Arquivos de configuração Railway criados
- ✅ Dockerfile configurado
- ✅ SPA routing configurado
- ⏳ Aguardando criação do repositório

**Depois que criar o repositório, o deploy vai funcionar automaticamente!** 🎉 