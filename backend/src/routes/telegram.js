import express from 'express';
import { logger } from '../utils/logger.js';
import { getBotConfig, getAllBotConfigs } from '../config/bots.js';
import { telegramService } from '../services/telegramService.js';

const router = express.Router();

// POST /api/telegram/webhook/:botId - Webhook específico do bot
router.post('/webhook/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const webhookData = req.body;
    
    logger.info('Webhook recebido do Telegram', { botId, updateType: webhookData.update_type });
    
    // Por enquanto, apenas logamos o webhook
    // Aqui você implementaria a lógica real do bot
    
    res.json({
      success: true,
      message: 'Webhook processado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao processar webhook:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao processar webhook',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/telegram/status - Status de todos os bots
router.get('/status', async (req, res) => {
  try {
    logger.info('Solicitação para status dos bots Telegram');
    
    const bots = getAllBotConfigs();
    
    const botStatus = bots.map(bot => ({
      id: bot.id,
      name: bot.name,
      status: bot.status,
      pixEnabled: bot.pix.enabled,
      lastActivity: bot.lastActivity,
      stats: bot.stats
    }));
    
    res.json({
      success: true,
      data: botStatus,
      total: botStatus.length,
      active: botStatus.filter(bot => bot.status === 'active').length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter status dos bots:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter status dos bots',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/telegram/message/:botId - Enviar mensagem via bot específico
router.post('/message/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const { chatId, message, parseMode = 'HTML' } = req.body;
    
    logger.info('Solicitação para enviar mensagem', { botId, chatId });
    
    const bot = getBotConfig(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    if (bot.status !== 'active') {
      return res.status(400).json({
        error: 'Bot não está ativo',
        timestamp: new Date().toISOString()
      });
    }
    
    // Por enquanto, simulamos o envio da mensagem
    // Aqui você implementaria a lógica real do Telegram
    
    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: {
        botId,
        chatId,
        message,
        sentAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao enviar mensagem',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/telegram/pix/:botId - Enviar PIX com QR Code via bot específico
router.post('/pix/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const { chatId, pixKey, value, expirationTime = '1 hora' } = req.body;
    
    logger.info('Solicitação para enviar PIX com QR Code', { botId, chatId, pixKey, value });
    
    const bot = getBotConfig(botId);
    if (!bot) {
      return res.status(404).json({
        error: 'Bot não encontrado',
        timestamp: new Date().toISOString()
      });
    }
    
    if (bot.status !== 'active') {
      return res.status(400).json({
        error: 'Bot não está ativo',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!bot.pix.enabled) {
      return res.status(400).json({
        error: 'PIX não está habilitado para este bot',
        timestamp: new Date().toISOString()
      });
    }
    
    // Enviar PIX com QR Code
    const result = await telegramService.sendPIXMessage(botId, chatId, {
      pixKey,
      value,
      expirationTime
    });
    
    res.json({
      success: true,
      message: 'PIX com QR Code enviado com sucesso',
      data: {
        botId,
        chatId,
        pixKey,
        value,
        expirationTime,
        sentAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao enviar PIX com QR Code:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao enviar PIX com QR Code',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export { router as telegramRoutes }; 