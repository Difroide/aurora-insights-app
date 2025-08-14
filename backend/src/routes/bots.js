import express from 'express';
import { logger } from '../utils/logger.js';
import { 
  addBotConfig, 
  getBotConfig, 
  getAllBotConfigs, 
  updateBotConfig, 
  removeBotConfig, 
  validateBotConfig,
  isBotPixEnabled,
  getBotPixConfig,
  updateBotStats,
  getBotsWithPix,
  getAllPixConfigs,
  enablePixForAllBots,
  getDefaultPixSettings
} from '../config/bots.js';
import { emitBotUpdate } from '../websocket/socket.js';

const router = express.Router();

// GET /api/bots - Listar todos os bots
router.get('/', async (req, res) => {
  try {
    logger.info('Solicitação para listar todos os bots');
    
    const bots = getAllBotConfigs();
    
    res.json({
      success: true,
      data: bots,
      total: bots.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao listar bots:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao listar bots',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bots - Criar novo bot
router.post('/', async (req, res) => {
  try {
    const botData = req.body;
    
    logger.info('Solicitação para criar novo bot', { botId: botData.id });
    
    // Validar dados do bot
    const validation = validateBotConfig(botData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Dados do bot inválidos',
        details: validation.errors,
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar se bot já existe
    if (getBotConfig(botData.id)) {
      return res.status(409).json({
        error: 'Bot já existe com este ID',
        timestamp: new Date().toISOString()
      });
    }
    
    // Criar bot
    const newBot = addBotConfig(botData.id, botData);
    
    // Emitir evento WebSocket
    emitBotUpdate(botData.id, {
      type: 'bot_created',
      bot: newBot
    });
    
    res.status(201).json({
      success: true,
      data: newBot,
      message: 'Bot criado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao criar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao criar bot',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bots/:id - Obter configuração do bot
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para obter bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: bot,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter bot',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/bots/:id - Atualizar configuração do bot
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info('Solicitação para atualizar bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validar dados se for uma atualização completa
    if (updates.token || updates.name) {
      const validation = validateBotConfig({ ...bot, ...updates });
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Dados do bot inválidos',
          details: validation.errors,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Atualizar bot
    const updatedBot = updateBotConfig(id, updates);
    
    // Emitir evento WebSocket
    emitBotUpdate(id, {
      type: 'bot_updated',
      bot: updatedBot
    });
    
    res.json({
      success: true,
      data: updatedBot,
      message: 'Bot atualizado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao atualizar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao atualizar bot',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/bots/:id - Remover bot
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para remover bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Remover bot
    const removed = removeBotConfig(id);
    
    if (removed) {
      // Emitir evento WebSocket
      emitBotUpdate(id, {
        type: 'bot_removed',
        botId: id
      });
      
      res.json({
        success: true,
        message: 'Bot removido com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        error: 'Erro ao remover bot',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    logger.error('Erro ao remover bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao remover bot',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bots/:id/start - Iniciar bot
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para iniciar bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Atualizar status para ativo
    const updatedBot = updateBotConfig(id, { status: 'active' });
    
    // Emitir evento WebSocket
    emitBotUpdate(id, {
      type: 'bot_started',
      bot: updatedBot
    });
    
    res.json({
      success: true,
      data: updatedBot,
      message: 'Bot iniciado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao iniciar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao iniciar bot',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bots/:id/stop - Parar bot
router.post('/:id/stop', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para parar bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    // Atualizar status para inativo
    const updatedBot = updateBotConfig(id, { status: 'inactive' });
    
    // Emitir evento WebSocket
    emitBotUpdate(id, {
      type: 'bot_stopped',
      bot: updatedBot
    });
    
    res.json({
      success: true,
      data: updatedBot,
      message: 'Bot parado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao parar bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao parar bot',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bots/:id/status - Status em tempo real
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para status do bot', { botId: id });
    
    const bot = getBotConfig(id);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    const status = {
      id: bot.id,
      name: bot.name,
      status: bot.status,
      pixEnabled: isBotPixEnabled(id),
      lastActivity: bot.lastActivity,
      stats: bot.stats,
      uptime: bot.lastActivity ? Date.now() - bot.lastActivity.getTime() : 0
    };
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter status do bot:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter status do bot',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/bots/pix - Listar bots com PIX habilitado
router.get('/pix', async (req, res) => {
  try {
    logger.info('Solicitação para listar bots com PIX');
    
    const botsWithPix = getBotsWithPix();
    
    res.json({
      success: true,
      data: botsWithPix,
      total: botsWithPix.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao listar bots com PIX:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao listar bots com PIX',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/bots/pix/enable-all - Forçar PIX em todos os bots
router.post('/pix/enable-all', async (req, res) => {
  try {
    logger.info('Solicitação para habilitar PIX em todos os bots');
    
    enablePixForAllBots();
    
    res.json({
      success: true,
      message: 'PIX habilitado em todos os bots',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao habilitar PIX em todos os bots:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao habilitar PIX',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as botRoutes }; 