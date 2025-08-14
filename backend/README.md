# 🚀 Aurora Insights - Backend

Backend Node.js completo para o sistema Aurora Insights, incluindo API REST, WebSocket em tempo real e integração com Telegram.

## ✨ Funcionalidades

- **🔌 API REST** completa para comunicação com frontend
- **⚡ WebSocket** para atualizações em tempo real
- **🤖 Sistema de Bots Dinâmico** - Suporte a múltiplos bots
- **📊 Analytics** em tempo real
- **🔒 Segurança** com rate limiting e CORS
- **📝 Logging** completo com Winston
- **🔑 Configuração Flexível** - Cada bot com suas próprias configurações
- **💳 PIX Global** - Sistema PIX habilitado por padrão em todos os bots

## 🛠️ Tecnologias

- **Node.js** 18+
- **Express.js** - Framework web
- **Socket.IO** - WebSocket em tempo real
- **GrammY** - Framework Telegram Bot
- **Winston** - Sistema de logging
- **Helmet** - Segurança HTTP
- **CORS** - Cross-origin resource sharing

## 📦 Instalação

### 1. Clonar e instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp env.example .env
# Editar .env com suas configurações
```

### 3. Configurar tokens
```env
# PushinPay API (compartilhado entre todos os bots)
PIX_API_TOKEN=seu_token_aqui
PIX_API_URL=https://api.pushinpay.com.br
```

**⚠️ IMPORTANTE:** 
- **NÃO** coloque tokens de bots no `.env`
- **SIM** coloque o token PIX da PushinPay no `.env` (será usado por todos os bots)
- **SIM** configure cada bot via API
- **SIM** use o sistema de configuração dinâmica
- **✅ PIX HABILITADO POR PADRÃO** em todos os bots automaticamente

### 4. Iniciar servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🤖 Sistema de Bots Dinâmico

### **Como Funciona:**
1. **Sem configuração fixa** - Não há tokens hardcoded
2. **Bots via API** - Adicione/remova bots via endpoints
3. **Configuração individual** - Cada bot tem suas próprias configurações
4. **PIX sempre habilitado** - Todos os bots têm PIX por padrão
5. **Segurança** - Tokens ficam protegidos no servidor

### **Exemplo de Configuração de Bot (PIX automático):**
```json
{
  "id": "bot_001",
  "name": "Bot Vendas",
  "token": "1234567890:ABC-DEF-GHI-JKL",
  "pix": {
    "enabled": true, // ✅ HABILITADO POR PADRÃO
    "settings": {
      "autoGenerate": true, // ✅ HABILITADO POR PADRÃO
      "qrCodeEnabled": true, // ✅ HABILITADO POR PADRÃO
      "expirationTime": 3600,
      "maxValue": 10000,
      "minValue": 0.01
    }
  },
  "settings": {
    "autoReply": true, // ✅ HABILITADO POR PADRÃO
    "welcomeMessage": "Olá! Como posso ajudar?",
    "language": "pt-BR",
    "timezone": "America/Sao_Paulo"
  }
}
```

### **Configurações PIX por Bot (Padrões):**
- **`enabled`** - ✅ **SEMPRE TRUE** por padrão (só false se explicitamente desabilitado)
- **`autoGenerate`** - ✅ **SEMPRE TRUE** por padrão (PIX automático)
- **`qrCodeEnabled`** - ✅ **SEMPRE TRUE** por padrão (QR Code sempre ativo)
- **`expirationTime`** - 3600 segundos (1 hora)
- **`maxValue`** - R$ 10.000
- **`minValue`** - R$ 0,01

**ℹ️ Nota:** 
- O `apiToken` é configurado globalmente no `.env` e usado por todos os bots
- **PIX é habilitado automaticamente** em todos os bots
- **Configurações são otimizadas** para vendas por padrão
- **Personalização** disponível se necessário

## 🌐 Endpoints da API

### Analytics
- `GET /api/analytics/overview` - Visão geral
- `GET /api/analytics/revenue` - Dados de receita
- `GET /api/analytics/funnels` - Performance dos funis
- `GET /api/analytics/bots` - Status dos bots
- `POST /api/analytics/refresh` - Forçar atualização
- `GET /api/analytics/export` - Exportar dados

### Bots (Sistema Dinâmico)
- `GET /api/bots` - Listar todos os bots
- `POST /api/bots` - Criar novo bot
- `GET /api/bots/:id` - Obter configuração do bot
- `PUT /api/bots/:id` - Atualizar configuração do bot
- `DELETE /api/bots/:id` - Remover bot
- `POST /api/bots/:id/start` - Iniciar bot
- `POST /api/bots/:id/stop` - Parar bot
- `GET /api/bots/:id/status` - Status em tempo real
- `GET /api/bots/pix` - Listar bots com PIX habilitado
- `POST /api/bots/pix/enable-all` - Forçar PIX em todos os bots

### Funis
- `GET /api/funnels` - Listar funis
- `POST /api/funnels` - Criar funil
- `PUT /api/funnels/:id` - Atualizar funil
- `DELETE /api/funnels/:id` - Remover funil

### Telegram
- `POST /api/telegram/webhook/:botId` - Webhook específico do bot
- `GET /api/telegram/status` - Status de todos os bots
- `POST /api/telegram/message/:botId` - Enviar mensagem via bot específico

## 🔌 WebSocket Events

### Conexão
- `connection` - Cliente conectado
- `disconnect` - Cliente desconectado

### Analytics
- `analytics:update` - Atualização de analytics
- `revenue:update` - Atualização de receita
- `transaction:update` - Nova transação

### Bots (Específicos por Bot)
- `bot:${botId}:status:update` - Status do bot alterado
- `bot:${botId}:message:update` - Nova mensagem do bot
- `bot:${botId}:pix:generated` - PIX gerado pelo bot
- `bot:${botId}:pix:paid` - PIX pago pelo bot

### Funis
- `funnel:update` - Funil atualizado
- `funnel:performance:update` - Performance atualizada

### PIX
- `pix:generated` - PIX gerado
- `pix:paid` - PIX pago
- `pix:expired` - PIX expirado

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações dinâmicas
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── websocket/       # Sistema WebSocket
│   ├── utils/           # Utilitários
│   └── server.js        # Servidor principal
├── logs/                # Arquivos de log
├── uploads/             # Arquivos enviados
├── package.json         # Dependências
├── env.example          # Variáveis de ambiente
└── README.md            # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|---------|-------------|
| `PORT` | Porta do servidor | `3001` | ❌ |
| `NODE_ENV` | Ambiente (development/production) | `development` | ❌ |
| `PIX_API_TOKEN` | Token da API PushinPay (global) | - | ❌ |
| `PIX_API_URL` | URL da API PushinPay | `https://api.pushinpay.com.br` | ❌ |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:8080` | ❌ |
| `LOG_LEVEL` | Nível de logging | `info` | ❌ |

### **⚠️ IMPORTANTE - Tokens:**
- **NÃO** coloque tokens de bots no `.env`
- **SIM** coloque o token PIX da PushinPay no `.env` (será usado por todos os bots)
- **SIM** configure cada bot via API
- **SIM** use o sistema de configuração dinâmica
- **✅ PIX SEMPRE HABILITADO** em todos os bots por padrão

### Segurança

- **Rate Limiting**: Configurável por IP
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configurável por ambiente
- **Compression**: Compressão gzip para respostas
- **Token Protection**: Tokens armazenados de forma segura
- **PIX Sharing**: Sistema PIX compartilhado entre bots
- **PIX Default**: PIX habilitado automaticamente

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3001/health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "config": {
    "totalBots": 3,
    "activeBots": 2,
    "botsWithPix": 3, // ✅ Todos os bots têm PIX por padrão
    "totalPixGenerated": 45,
    "totalRevenue": 1234.56,
    "pixAvailable": true,
    "websocketPort": 3002
  }
}
```

### WebSocket Status
```javascript
// Conectar ao WebSocket
const socket = io('http://localhost:3001');

// Escutar eventos específicos de um bot
socket.emit('bot:subscribe', 'bot_001');
socket.on('bot:bot_001:pix:generated', (data) => {
  console.log('PIX gerado pelo bot:', data);
});
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 🔍 Debugging

### Logs em tempo real
```bash
tail -f logs/app.log
```

### Verificar configurações de bots
```bash
curl http://localhost:3001/api/bots
```

### Verificar bots com PIX
```bash
curl http://localhost:3001/api/bots/pix
```

## 📚 Exemplos de Uso

### 1. Criar um Bot (PIX automático)
```bash
curl -X POST http://localhost:3001/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "id": "bot_001",
    "name": "Bot Vendas Premium",
    "token": "1234567890:ABC-DEF-GHI-JKL"
    # PIX habilitado automaticamente com configurações padrão
  }'
```

### 2. Criar um Bot com Configurações PIX Personalizadas
```bash
curl -X POST http://localhost:3001/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "id": "bot_002",
    "name": "Bot Vendas VIP",
    "token": "0987654321:XYZ-WUV-RST-QPO",
    "pix": {
      "settings": {
        "maxValue": 50000, // R$ 50.000
        "minValue": 100,   // R$ 100
        "expirationTime": 7200 // 2 horas
      }
    }
  }'
```

### 3. Criar um Bot sem PIX (explicitamente desabilitado)
```bash
curl -X POST http://localhost:3001/api/bots \
  -H "Content-Type: application/json" \
  -d '{
    "id": "bot_003",
    "name": "Bot Suporte",
    "token": "1122334455:ABC-DEF-GHI-JKL",
    "pix": {
      "enabled": false // ❌ Único caso onde PIX é desabilitado
    }
  }'
```

### 4. Forçar PIX em Todos os Bots
```bash
curl -X POST http://localhost:3001/api/bots/pix/enable-all
```

### 5. Atualizar Configuração PIX de um Bot
```bash
curl -X PUT http://localhost:3001/api/bots/bot_001 \
  -H "Content-Type: application/json" \
  -d '{
    "pix": {
      "settings": {
        "maxValue": 10000,
        "expirationTime": 7200
      }
    }
  }'
```

### 6. Iniciar um Bot
```bash
curl -X POST http://localhost:3001/api/bots/bot_001/start
```

### 7. Verificar Status
```bash
curl http://localhost:3001/api/bots/bot_001/status
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/aurora-insights/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/aurora-insights/wiki)
- **Email**: suporte@aurora-insights.com

---

**Aurora Insights** - Transformando dados em insights acionáveis! 🚀✨ 