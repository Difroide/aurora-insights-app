# Aurora Insights - Sistema de Funis e Bots do Telegram

Sistema completo para criação de funis de vendas e bots automatizados do Telegram com integração inteligente e **geração automática de PIX via PushinPay**.

## 🚀 Funcionalidades

### ✨ Criação de Funis
- **Nome personalizado** para cada funil
- **Upload de mídia** (imagens, vídeos, documentos) para Supabase Storage
- **Mensagem de boas-vindas** personalizada
- **Botões inline configuráveis** com:
  - Nome do botão
  - Valor do produto/serviço
  - Link VIP para conversão
  - **🆕 Geração automática de PIX** (PushinPay)
  - **🆕 Orderbump** - ofertas adicionais antes do pagamento
- **Armazenamento em nuvem** com Supabase

### 🤖 Bots do Telegram
- **Criação de bots** com token personalizado
- **Associação automática** a funis existentes
- **Resposta automática** ao comando `/start`
- **Envio de mídia + mensagem** configurada no funil
- **Botões inline funcionais** que direcionam para links VIP ou **geram PIX automaticamente**
- **Controle de status** (Ativo/Pausado)
- **🆕 Tracking de usuários** que iniciam `/start`

### 💳 Integração PushinPay
- **Geração automática de PIX** para botões configurados
- **QR Code automático** enviado via Telegram
- **Chave copia e cola** para pagamento fácil
- **Botões secundários** para ver QR Code e confirmar pagamento
- **Validação de valores** (limite R$ 150,00)
- **Webhook para confirmações** de pagamento
- **Status em tempo real** das transações
- **Fluxo completo** como no pix.py original

### 🔐 Autenticação e Segurança
- **Sistema de login/cadastro** com Supabase Auth
- **Proteção de rotas** - usuários só acessam após autenticação
- **Armazenamento seguro** de dados por usuário
- **Row Level Security** (RLS) no banco de dados
- **Upload seguro** de mídia com controle de acesso

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Bot API**: GrammY.js (Telegram Bot API)
- **Pagamentos**: PushinPay API (PIX)
- **Estado**: React Hooks + Supabase
- **Roteamento**: React Router DOM

## 📦 Instalação

### Pré-requisitos
1. Conta no [Supabase](https://supabase.com)
2. Node.js e npm instalados
3. Token da API PushinPay

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/aurora-insights.git
cd aurora-insights
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. **Criar projeto no Supabase**:
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Anote a URL e chave anônima

2. **Configurar banco de dados**:
   - Execute o script `supabase-schema.sql` no SQL Editor
   - Execute o script `setup-storage.sql` para configurar o bucket de mídia

3. **Ver instruções detalhadas**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 4. Configure as variáveis de ambiente
```bash
cp config.example.env .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
# Configurações do Supabase (obrigatórias)
VITE_SUPABASE_URL=sua_url_do_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui

# Outras configurações (opcionais)
VITE_APP_NAME=Aurora Insights
VITE_APP_VERSION=1.0.0
```

**Nota**: O token da PushinPay é configurado individualmente por cada usuário nas configurações da aplicação.

### 5. Execute o projeto
```bash
npm run dev
```

### 6. Acesse a aplicação
```
http://localhost:8080
```

## 🎯 Como Usar

### 1. Primeiro Acesso

1. **Cadastre-se** ou **faça login** na aplicação
2. Configure suas credenciais da PushinPay em **"Configurações"**
3. Teste a conexão com a API

### 2. Criar um Funil

1. Acesse a página **"Funis"**
2. Clique em **"Novo Funil"**
3. Preencha:
   - **Nome do funil** (obrigatório)
   - **Upload de mídia** (opcional) - arquivos do seu computador
   - **Mensagem de boas-vindas** (obrigatório)
   - **Botões inline** com nome, valor e link VIP
   - **🆕 Ative "Gerar PIX automaticamente"** para botões de pagamento
   - **🆕 Configure Orderbump** para ofertas adicionais
4. Clique em **"Salvar Funil"**

### 3. Configurar PIX Automático

1. **No modal de criação de funis:**
   - Configure o botão com valor (ex: R$ 97,00)
   - Ative o switch **"Gerar PIX automaticamente"**
   - O sistema gerará automaticamente um PIX via PushinPay
   - O botão será marcado como "(PIX)" na interface

### 4. Criar um Bot

1. Acesse a página **"Bots"**
2. Clique em **"Novo Bot"**
3. Preencha:
   - **Nome do bot** (obrigatório)
   - **Token do bot** (obrigatório - obtenha com @BotFather)
   - **Selecione um funil** (obrigatório)
4. Clique em **"Criar Bot"**

### 5. Obter Token do Bot

1. Abra o Telegram
2. Procure por **@BotFather**
3. Envie `/newbot`
4. Siga as instruções para criar seu bot
5. Copie o token fornecido

## 🔧 Configuração dos Bots

### Comportamento Automático

- **Comando `/start`**: Envia automaticamente o funil configurado
- **Mídia + Mensagem**: Enviados juntos com botões inline
- **Botões Clicáveis**: 
  - **Links VIP**: Direcionam usuários para páginas de conversão
  - **🆕 PIX**: Geram automaticamente QR Code de pagamento
- **🆕 Orderbump**: Ofertas adicionais antes do PIX
- **Fluxo PIX Completo**:
  1. **Usuário clica** no botão PIX
  2. **Sistema gera PIX** via API PushinPay
  3. **Envia chave copia e cola** + botões secundários
  4. **Botões secundários**: "👁️ Ver QR Code" e "💸 Já Fiz o Pagamento"
  5. **Verificação de status** via API automática
  6. **Confirmação**: "✅ Pagamento confirmado!" + Link VIP
- **Resposta Inteligente**: Processa interações automaticamente

### Estrutura da Mensagem

```
[IMAGEM/VIDEO/DOCUMENTO]
└── Caption: Mensagem de boas-vindas configurada

[BOTÕES INLINE]
├── Nome do Produto - R$ 97,00 (PIX) ← PIX automático
├── Outro Produto - R$ 147,00 ← Link VIP
└── Mais Produtos...
```

## 📱 Exemplo de Uso

### Cenário: Venda de E-book com PIX

1. **Criar Funil**:
   - Nome: "E-book Marketing Digital"
   - Mídia: Capa do e-book (upload do computador)
   - Mensagem: "🎉 Bem-vindo! Descubra os segredos do marketing digital..."
   - Botões:
     - "Comprar E-book - R$ 47,00" → **PIX automático** ✅
     - "Versão Premium - R$ 97,00" → **PIX automático** ✅

2. **Criar Bot**:
   - Nome: "Bot Marketing"
   - Token: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
   - Funil: "E-book Marketing Digital"

3. **Resultado**:
   - Usuário envia `/start` no bot
   - Recebe automaticamente: imagem + mensagem + botões
   - Clica no botão PIX → Recebe QR Code + instruções
   - **Pagamento automático via PIX!** 🎯
   - **Confirmação**: "✅ Pagamento confirmado!" + Link do e-book

## 🔐 Configuração PushinPay

### Configuração Simples

A configuração da PushinPay é extremamente simples e requer apenas:

```env
# Token de autenticação da API
VITE_PIX_API_TOKEN=seu_token_aqui
```

### URLs da API (Fixas e Otimizadas)

O sistema usa automaticamente as URLs otimizadas da PushinPay:

- **Gerar PIX**: `https://api.pushinpay.com.br/api/pix/cashIn`
- **Status PIX**: `https://api.pushinpay.com.br/api/transactions/{id}`

### Limitações da API

- **Valor máximo**: R$ 150,00 por PIX
- **Formato de valor**: R$ XX,XX (com vírgula)
- **Validação automática**: Sistema verifica limites antes de gerar
- **URLs fixas**: Otimizadas e testadas para máxima compatibilidade
- **Chave copia e cola**: Gerada automaticamente para cada PIX

## 🚨 Limitações e Considerações

### Frontend Only
- **Armazenamento local**: Dados salvos no navegador
- **Sem persistência**: Dados perdidos ao limpar cache
- **Sem sincronização**: Apenas dispositivo local

### Bots do Telegram
- **Token válido**: Necessário token ativo do @BotFather
- **Webhook/Polling**: GrammY usa polling por padrão
- **Rate Limits**: Respeite limites da API do Telegram

### PushinPay
- **Token válido**: Necessário token ativo da API
- **Limite de valor**: Máximo R$ 150,00 por PIX
- **Webhook**: Para confirmações automáticas

## 🔮 Próximas Funcionalidades

- [ ] **Backend completo** com banco de dados
- [ ] **Sincronização em nuvem** entre dispositivos
- [ ] **Analytics avançados** de conversão
- [ ] **Templates de funis** pré-configurados
- [ ] **Integração com APIs** de pagamento
- [ ] **Dashboard de métricas** em tempo real
- [ ] **🆕 Relatórios de PIX** e conversões
- [ ] **🆕 Notificações automáticas** de pagamentos

## 🆘 Suporte

### Problemas Comuns

1. **Bot não responde**:
   - Verifique se o token está correto
   - Confirme se o bot está ativo
   - Teste o comando `/start` no Telegram

2. **PIX não gera**:
   - Verifique se as variáveis de ambiente estão configuradas
   - Confirme se o valor está no formato R$ XX,XX
   - Verifique se o valor não excede R$ 150,00
   - Teste a conexão com a API PushinPay

3. **Mídia não carrega**:
   - Verifique formato do arquivo
   - Tamanho máximo: 50MB
   - Formatos suportados: JPG, PNG, MP4, PDF

4. **Botões não funcionam**:
   - Verifique se todos os campos estão preenchidos
   - Links devem começar com `http://` ou `https://`
   - Para PIX: ative o switch "Gerar PIX automaticamente"

### Logs e Debug
- Abra o **Console do navegador** (F12)
- Verifique mensagens de erro
- Logs detalhados de todas as operações
- **🆕 Logs de PIX** na aba Network

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.

---

**Desenvolvido com ❤️ para automatizar suas vendas no Telegram com PIX automático!**
