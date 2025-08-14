import { logger } from '../utils/logger.js';

// Armazenar conexões ativas
const activeConnections = new Map();

// Eventos disponíveis
export const EVENTS = {
  // Analytics
  ANALYTICS_UPDATE: 'analytics:update',
  REVENUE_UPDATE: 'revenue:update',
  TRANSACTION_UPDATE: 'transaction:update',
  
  // Bots
  BOT_STATUS_UPDATE: 'bot:status:update',
  BOT_MESSAGE_UPDATE: 'bot:message:update',
  
  // Funis
  FUNNEL_UPDATE: 'funnel:update',
  FUNNEL_PERFORMANCE_UPDATE: 'funnel:performance:update',
  
  // PIX
  PIX_GENERATED: 'pix:generated',
  PIX_PAID: 'pix:paid',
  PIX_EXPIRED: 'pix:expired',
  
  // Sistema
  SYSTEM_ALERT: 'system:alert',
  CONNECTION_STATUS: 'connection:status'
};

export function setupWebSocket(io) {
  logger.info('Configurando WebSocket...');

  io.on('connection', (socket) => {
    const clientId = socket.id;
    const clientInfo = {
      id: clientId,
      connectedAt: new Date(),
      userAgent: socket.handshake.headers['user-agent'],
      ip: socket.handshake.address
    };

    activeConnections.set(clientId, clientInfo);
    
    logger.info(`Cliente WebSocket conectado: ${clientId}`, clientInfo);

    // Enviar status de conexão
    socket.emit(EVENTS.CONNECTION_STATUS, {
      status: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    });

    // Broadcast para outros clientes
    socket.broadcast.emit(EVENTS.CONNECTION_STATUS, {
      status: 'client_connected',
      clientId,
      timestamp: new Date().toISOString()
    });

    // Handler para join em salas específicas
    socket.on('join:room', (room) => {
      socket.join(room);
      logger.info(`Cliente ${clientId} entrou na sala: ${room}`);
      
      socket.emit('room:joined', {
        room,
        timestamp: new Date().toISOString()
      });
    });

    // Handler para leave de salas
    socket.on('leave:room', (room) => {
      socket.leave(room);
      logger.info(`Cliente ${clientId} saiu da sala: ${room}`);
      
      socket.emit('room:left', {
        room,
        timestamp: new Date().toISOString()
      });
    });

    // Handler para analytics em tempo real
    socket.on('analytics:subscribe', (filters = {}) => {
      socket.join('analytics');
      logger.info(`Cliente ${clientId} inscrito em analytics`, filters);
      
      // Enviar dados iniciais
      socket.emit(EVENTS.ANALYTICS_UPDATE, {
        type: 'initial',
        timestamp: new Date().toISOString()
      });
    });

    // Handler para bot updates
    socket.on('bot:subscribe', (botId) => {
      const room = `bot:${botId}`;
      socket.join(room);
      logger.info(`Cliente ${clientId} inscrito em bot: ${botId}`);
    });

    // Handler para funnel updates
    socket.on('funnel:subscribe', (funnelId) => {
      const room = `funnel:${funnelId}`;
      socket.join(room);
      logger.info(`Cliente ${clientId} inscrito em funnel: ${funnelId}`);
    });

    // Handler para PIX updates
    socket.on('pix:subscribe', (transactionId) => {
      const room = `pix:${transactionId}`;
      socket.join(room);
      logger.info(`Cliente ${clientId} inscrito em PIX: ${transactionId}`);
    });

    // Handler para desconexão
    socket.on('disconnect', (reason) => {
      activeConnections.delete(clientId);
      
      logger.info(`Cliente WebSocket desconectado: ${clientId}`, {
        reason,
        totalConnections: activeConnections.size
      });

      // Broadcast para outros clientes
      socket.broadcast.emit(EVENTS.CONNECTION_STATUS, {
        status: 'client_disconnected',
        clientId,
        reason,
        timestamp: new Date().toISOString()
      });
    });

    // Handler para erros
    socket.on('error', (error) => {
      logger.error(`Erro no WebSocket do cliente ${clientId}:`, error);
    });
  });

  logger.info(`WebSocket configurado com sucesso. Conexões ativas: ${activeConnections.size}`);
}

// Funções para emitir eventos para clientes específicos
export function emitToClient(clientId, event, data) {
  const io = global.io; // Referência global para o servidor io
  if (io && activeConnections.has(clientId)) {
    io.to(clientId).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

export function emitToRoom(room, event, data) {
  const io = global.io;
  if (io) {
    io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

export function emitToAll(event, data) {
  const io = global.io;
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}

// Funções específicas para diferentes tipos de eventos
export function emitAnalyticsUpdate(data) {
  emitToRoom('analytics', EVENTS.ANALYTICS_UPDATE, data);
}

export function emitBotUpdate(botId, data) {
  emitToRoom(`bot:${botId}`, EVENTS.BOT_STATUS_UPDATE, data);
}

export function emitFunnelUpdate(funnelId, data) {
  emitToRoom(`funnel:${funnelId}`, EVENTS.FUNNEL_UPDATE, data);
}

export function emitPIXUpdate(transactionId, data) {
  emitToRoom(`pix:${transactionId}`, EVENTS.PIX_GENERATED, data);
}

export function emitSystemAlert(message, level = 'info') {
  emitToAll(EVENTS.SYSTEM_ALERT, {
    message,
    level,
    timestamp: new Date().toISOString()
  });
}

// Função para obter estatísticas das conexões
export function getConnectionStats() {
  return {
    totalConnections: activeConnections.size,
    connections: Array.from(activeConnections.values()),
    timestamp: new Date().toISOString()
  };
}

// Função para limpar conexões inativas
export function cleanupInactiveConnections() {
  const now = new Date();
  const inactiveThreshold = 30 * 60 * 1000; // 30 minutos
  
  for (const [clientId, clientInfo] of activeConnections.entries()) {
    if (now - clientInfo.connectedAt > inactiveThreshold) {
      activeConnections.delete(clientId);
      logger.warn(`Conexão inativa removida: ${clientId}`);
    }
  }
}

// Limpeza automática a cada 5 minutos
setInterval(cleanupInactiveConnections, 5 * 60 * 1000); 