# 🚀 Deploy no Railway - Aurora Insights

Guia completo para fazer deploy da aplicação Aurora Insights no Railway.

## 📋 Pré-requisitos

1. **Conta no Railway**: [railway.app](https://railway.app)
2. **Conta no GitHub**: Para conectar o repositório
3. **Projeto configurado**: Supabase e PushinPay configurados

## 🚀 Passo a Passo

### 1. Acesse o Railway

1. Vá para [railway.app](https://railway.app)
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**

### 2. Conecte o Repositório

1. Selecione **"Deploy from GitHub repo"**
2. Escolha o repositório: `Difroide/aurora-insights`
3. Clique em **"Deploy Now"**

### 3. Configure as Variáveis de Ambiente

Após o deploy inicial, vá em **"Variables"** e adicione:

```env
# Configurações do Supabase (obrigatórias)
VITE_SUPABASE_URL=https://hllycihdvkcvhxjssevd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Outras configurações (opcionais)
VITE_APP_NAME=Aurora Insights
VITE_APP_VERSION=1.0.0
```

**Nota**: Não é necessário configurar o token da PushinPay aqui, pois cada usuário configura seu próprio token nas configurações da aplicação.

### 4. Configure o Domínio

1. Vá em **"Settings"**
2. Em **"Domains"**, clique em **"Generate Domain"**
3. Ou configure um domínio customizado

### 5. Verifique o Deploy

1. O Railway irá automaticamente:
   - Instalar dependências (`npm install`)
   - Fazer build (`npm run build`)
   - Iniciar o servidor (`npm run preview`)

2. Acesse o domínio gerado para verificar se está funcionando

## 🔧 Configurações Avançadas

### Build Command (Automático)
```bash
npm run build
```

### Start Command (Automático)
```bash
npm run preview
```

### Port (Automático)
O Railway detecta automaticamente a porta 4173 do Vite Preview.

## 🚨 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o script `build` existe
- Verifique os logs no Railway

### Erro de Variáveis de Ambiente
- Confirme se todas as variáveis estão configuradas
- Verifique se os valores estão corretos
- Reinicie o deploy após alterar variáveis

### Erro de CORS
- Configure o domínio do Railway no Supabase
- Vá em Supabase > Settings > API
- Adicione o domínio do Railway em "Additional Allowed Origins"

## 📱 URLs Importantes

### Railway
- **Dashboard**: https://railway.app/dashboard
- **Projeto**: https://railway.app/project/[seu-projeto]

### Supabase
- **Dashboard**: https://supabase.com/dashboard
- **Configurações**: https://supabase.com/dashboard/project/[seu-projeto]/settings/api

## 🎯 Próximos Passos

1. **Teste a aplicação** no domínio do Railway
2. **Configure CORS** no Supabase se necessário
3. **Teste os bots** do Telegram
4. **Monitore os logs** no Railway

## 💡 Dicas

- **Logs em tempo real**: Use o Railway para monitorar logs
- **Rollback**: Railway permite voltar para versões anteriores
- **Auto-deploy**: Cada push no GitHub gera um novo deploy
- **Custom domain**: Configure um domínio personalizado se necessário

---

**🎉 Sua aplicação estará online e funcionando!** 