import { logger } from '../utils/logger.js';

// Configuração padrão dos bots
const defaultBotConfig = {
  // Configurações de PIX (global para todos os bots)
  pix: {
    apiToken: process.env.PIX_API_TOKEN,
    apiUrl: process.env.PIX_API_URL || 'https://api.pushinpay.com.br',
    webhookUrl: process.env.PIX_WEBHOOK_URL
  },
  
  // Configurações de segurança
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      credentials: true
    }
  },
  
  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  },
  
  // Configurações de WebSocket
  websocket: {
    port: parseInt(process.env.WS_PORT) || 3002,
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      methods: ['GET', 'POST']
    }
  }
};

// Configuração de bots individuais
const botConfigs = new Map();

// Função para adicionar configuração de bot
export function addBotConfig(botId, config) {
  try {
    const botConfig = {
      id: botId,
      name: config.name || `Bot ${botId}`,
      token: config.token,
      webhook: config.webhook || null,
      
      // Configuração PIX (HABILITADO POR PADRÃO para todos os bots)
      pix: {
        enabled: config.pix?.enabled !== false, // true por padrão, só false se explicitamente desabilitado
        // Usa o token global da configuração padrão
        apiToken: defaultBotConfig.pix.apiToken,
        apiUrl: defaultBotConfig.pix.apiUrl,
        webhookUrl: defaultBotConfig.pix.webhookUrl,
        // Configurações específicas de PIX por bot
        settings: {
          autoGenerate: config.pix?.settings?.autoGenerate !== false, // true por padrão
          qrCodeEnabled: config.pix?.settings?.qrCodeEnabled !== false, // true por padrão
          expirationTime: config.pix?.settings?.expirationTime || 3600, // 1 hora
          maxValue: config.pix?.settings?.maxValue || 10000, // R$ 10.000
          minValue: config.pix?.settings?.minValue || 0.01 // R$ 0,01
        }
      },
      
      // Configurações gerais do bot
      settings: {
        autoReply: config.settings?.autoReply !== false, // true por padrão
        welcomeMessage: config.settings?.welcomeMessage || 'Olá! Como posso ajudar?',
        maxMessagesPerMinute: config.settings?.maxMessagesPerMinute || 10,
        language: config.settings?.language || 'pt-BR',
        timezone: config.settings?.timezone || 'America/Sao_Paulo'
      },
      
      // Metadados
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'inactive', // inactive, active, paused, error
      lastActivity: null,
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        pixGenerated: 0,
        pixPaid: 0,
        totalRevenue: 0
      }
    };
    
    botConfigs.set(botId, botConfig);
    logger.info(`Configuração do bot ${botId} adicionada`, { 
      botId, 
      name: botConfig.name,
      pixEnabled: botConfig.pix.enabled,
      hasPixToken: !!botConfig.pix.apiToken,
      pixSettings: botConfig.pix.settings
    });
    
    return botConfig;
  } catch (error) {
    logger.error(`Erro ao adicionar configuração do bot ${botId}:`, error);
    throw error;
  }
}

// Função para obter configuração de bot
export function getBotConfig(botId) {
  return botConfigs.get(botId);
}

// Função para listar todas as configurações de bots
export function getAllBotConfigs() {
  return Array.from(botConfigs.values());
}

// Função para atualizar configuração de bot
export function updateBotConfig(botId, updates) {
  try {
    const existingConfig = botConfigs.get(botId);
    if (!existingConfig) {
      throw new Error(`Bot ${botId} não encontrado`);
    }
    
    const updatedConfig = {
      ...existingConfig,
      ...updates,
      updatedAt: new Date()
    };
    
    // Manter o token PIX global (não pode ser alterado por bot)
    if (updates.pix) {
      updatedConfig.pix.apiToken = defaultBotConfig.pix.apiToken;
      updatedConfig.pix.apiUrl = defaultBotConfig.pix.apiUrl;
      updatedConfig.pix.webhookUrl = defaultBotConfig.pix.webhookUrl;
      
      // Garantir que PIX continue habilitado por padrão
      if (updates.pix.enabled === undefined) {
        updatedConfig.pix.enabled = true;
      }
      
      // Garantir que configurações PIX tenham valores padrão
      if (updates.pix.settings) {
        updatedConfig.pix.settings = {
          autoGenerate: updates.pix.settings.autoGenerate !== false,
          qrCodeEnabled: updates.pix.settings.qrCodeEnabled !== false,
          expirationTime: updates.pix.settings.expirationTime || 3600,
          maxValue: updates.pix.settings.maxValue || 10000,
          minValue: updates.pix.settings.minValue || 0.01
        };
      }
    }
    
    botConfigs.set(botId, updatedConfig);
    logger.info(`Configuração do bot ${botId} atualizada`, { botId, updates });
    
    return updatedConfig;
  } catch (error) {
    logger.error(`Erro ao atualizar configuração do bot ${botId}:`, error);
    throw error;
  }
}

// Função para remover configuração de bot
export function removeBotConfig(botId) {
  try {
    const removed = botConfigs.delete(botId);
    if (removed) {
      logger.info(`Configuração do bot ${botId} removida`);
    }
    return removed;
  } catch (error) {
    logger.error(`Erro ao remover configuração do bot ${botId}:`, error);
    throw error;
  }
}

// Função para validar configuração de bot
export function validateBotConfig(config) {
  const errors = [];
  
  if (!config.token) {
    errors.push('Token do bot é obrigatório');
  }
  
  if (!config.name) {
    errors.push('Nome do bot é obrigatório');
  }
  
  // Validação específica para PIX (agora sempre habilitado por padrão)
  if (!process.env.PIX_API_TOKEN) {
    errors.push('Token da API PIX global não está configurado');
  }
  
  // Validações de configurações PIX se fornecidas
  if (config.pix?.settings) {
    if (config.pix.settings.maxValue <= config.pix.settings.minValue) {
      errors.push('Valor máximo deve ser maior que o valor mínimo');
    }
    
    if (config.pix.settings.expirationTime < 300) { // 5 minutos mínimo
      errors.push('Tempo de expiração deve ser pelo menos 5 minutos');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para obter configuração padrão
export function getDefaultConfig() {
  return { ...defaultBotConfig };
}

// Função para verificar se um bot está configurado
export function isBotConfigured(botId) {
  return botConfigs.has(botId);
}

// Função para verificar se um bot tem PIX habilitado
export function isBotPixEnabled(botId) {
  const config = getBotConfig(botId);
  // PIX sempre habilitado por padrão, a menos que explicitamente desabilitado
  return config?.pix?.enabled !== false && !!defaultBotConfig.pix.apiToken;
}

// Função para obter configuração PIX de um bot
export function getBotPixConfig(botId) {
  const config = getBotConfig(botId);
  if (!config || !defaultBotConfig.pix.apiToken) {
    return null;
  }
  
  // Retorna configuração PIX mesmo se explicitamente desabilitado (para casos especiais)
  return {
    ...config.pix,
    apiToken: defaultBotConfig.pix.apiToken,
    apiUrl: defaultBotConfig.pix.apiUrl
  };
}

// Função para verificar se PIX está disponível globalmente
export function isPixAvailable() {
  return !!process.env.PIX_API_TOKEN;
}

// Função para atualizar estatísticas do bot
export function updateBotStats(botId, statsUpdate) {
  try {
    const config = getBotConfig(botId);
    if (!config) {
      throw new Error(`Bot ${botId} não encontrado`);
    }
    
    const updatedConfig = {
      ...config,
      stats: {
        ...config.stats,
        ...statsUpdate
      },
      lastActivity: new Date(),
      updatedAt: new Date()
    };
    
    botConfigs.set(botId, updatedConfig);
    return updatedConfig;
  } catch (error) {
    logger.error(`Erro ao atualizar estatísticas do bot ${botId}:`, error);
    throw error;
  }
}

// Função para obter estatísticas de configuração
export function getConfigStats() {
  const bots = Array.from(botConfigs.values());
  
  return {
    totalBots: bots.length,
    activeBots: bots.filter(bot => bot.status === 'active').length,
    botsWithPix: bots.filter(bot => bot.pix.enabled !== false).length, // Todos os bots por padrão
    botsWithWebhook: bots.filter(bot => bot.webhook).length,
    totalPixGenerated: bots.reduce((total, bot) => total + bot.stats.pixGenerated, 0),
    totalRevenue: bots.reduce((total, bot) => total + bot.stats.totalRevenue, 0),
    pixAvailable: isPixAvailable(),
    lastUpdated: bots.reduce((latest, bot) => 
      bot.updatedAt > latest ? bot.updatedAt : latest, new Date(0)
    )
  };
}

// Função para listar bots com PIX habilitado
export function getBotsWithPix() {
  if (!isPixAvailable()) {
    return [];
  }
  
  // Retorna todos os bots (PIX habilitado por padrão)
  return Array.from(botConfigs.values()).filter(bot => 
    bot.pix.enabled !== false
  );
}

// Função para obter configurações PIX de todos os bots
export function getAllPixConfigs() {
  if (!isPixAvailable()) {
    return [];
  }
  
  const pixConfigs = [];
  
  for (const [botId, config] of botConfigs.entries()) {
    // Inclui todos os bots (PIX habilitado por padrão)
    pixConfigs.push({
      botId,
      botName: config.name,
      pixEnabled: config.pix.enabled !== false,
      pixConfig: {
        ...config.pix,
        apiToken: defaultBotConfig.pix.apiToken,
        apiUrl: defaultBotConfig.pix.apiUrl
      }
    });
  }
  
  return pixConfigs;
}

// Função para forçar PIX em todos os bots
export function enablePixForAllBots() {
  for (const [botId, config] of botConfigs.entries()) {
    if (config.pix.enabled === false) {
      config.pix.enabled = true;
      config.updatedAt = new Date();
      logger.info(`PIX habilitado para bot ${botId}`);
    }
  }
}

// Função para obter configuração PIX padrão para novos bots
export function getDefaultPixSettings() {
  return {
    enabled: true,
    settings: {
      autoGenerate: true,
      qrCodeEnabled: true,
      expirationTime: 3600,
      maxValue: 10000,
      minValue: 0.01
    }
  };
}

// Exportar configuração padrão
export { defaultBotConfig }; 