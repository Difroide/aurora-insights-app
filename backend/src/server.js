import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rotas e serviços
import { telegramRoutes } from './routes/telegram.js';
import { analyticsRoutes } from './routes/analytics.js';
import { botRoutes } from './routes/bots.js';
import { funnelRoutes } from './routes/funnels.js';
import { setupWebSocket } from './websocket/socket.js';
import { logger } from './utils/logger.js';
import { telegramService } from './services/telegramService.js';
import { getDefaultConfig, getConfigStats, isPixAvailable } from './config/bots.js';

// Configurar dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// Obter configuração padrão
const config = getDefaultConfig();

// Configurar Socket.IO com configuração dinâmica
const io = new Server(server, {
  cors: config.websocket.cors
});

const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// Middleware de CORS com configuração dinâmica
app.use(cors(config.security.cors));

// Rate limiting com configuração dinâmica
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.'
  }
});
app.use('/api/', limiter);

// Middleware de compressão
app.use(compression());

// Middleware de logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir arquivos estáticos
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  const botStats = getConfigStats();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    config: {
      totalBots: botStats.totalBots,
      activeBots: botStats.activeBots,
      botsWithPix: botStats.botsWithPix,
      totalPixGenerated: botStats.totalPixGenerated,
      totalRevenue: botStats.totalRevenue,
      pixAvailable: botStats.pixAvailable,
      websocketPort: config.websocket.port
    }
  });
});

// Rotas da API
app.use('/api/telegram', telegramRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/funnels', funnelRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Rota 404 para endpoints não encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint não encontrado',
      path: req.originalUrl
    }
  });
});

// Configurar WebSocket
setupWebSocket(io);

// Inicializar serviços
async function initializeServices() {
  try {
    // Inicializar telegram service
    await telegramService.initialize();
    logger.info('Telegram service inicializado com sucesso');
    
    // Log das configurações
    const botStats = getConfigStats();
    logger.info('Configurações carregadas:', {
      port: PORT,
      corsOrigin: config.security.cors.origin,
      websocketPort: config.websocket.port,
      rateLimit: config.security.rateLimit,
      pix: {
        available: isPixAvailable(),
        apiUrl: config.pix.apiUrl
      },
      bots: {
        total: botStats.totalBots,
        withPix: botStats.botsWithPix,
        active: botStats.activeBots
      }
    });
    
  } catch (error) {
    logger.error('Erro ao inicializar serviços:', error);
    process.exit(1);
  }
}

// Iniciar servidor
async function startServer() {
  try {
    await initializeServices();
    
    server.listen(PORT, () => {
      const botStats = getConfigStats();
      
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📊 Dashboard: http://localhost:${PORT}/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🤖 Sistema de bots: Dinâmico (${botStats.totalBots} bots configurados)`);
      logger.info(`🔑 PIX: ${isPixAvailable() ? 'Disponível' : 'Não configurado'}`);
      logger.info(`💰 Receita total: R$ ${botStats.totalRevenue.toFixed(2)}`);
    });
    
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

// Iniciar servidor
startServer(); 