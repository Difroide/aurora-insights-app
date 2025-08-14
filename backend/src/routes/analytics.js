import express from 'express';
import { logger } from '../utils/logger.js';
import { emitAnalyticsUpdate } from '../websocket/socket.js';

const router = express.Router();

// Middleware para validar parâmetros de data
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Datas inválidas. Use formato ISO (YYYY-MM-DD)'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        error: 'Data inicial deve ser menor que a data final'
      });
    }
  }
  
  next();
};

// GET /api/analytics/overview - Visão geral dos analytics
router.get('/overview', validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, timeRange = 'month' } = req.query;
    
    logger.info('Solicitação de analytics overview', { startDate, endDate, timeRange });
    
    // Aqui você implementaria a lógica real de analytics
    // Por enquanto, retornamos dados simulados
    const overview = {
      totalRevenue: 45231.50,
      totalTransactions: 1234,
      activeBots: 5,
      totalFunnels: 12,
      conversionRate: 3.2,
      revenueGrowth: 20.1,
      userGrowth: 15.8,
      transactionGrowth: 18.5,
      topFunnels: [
        { name: 'Funnel Premium', revenue: 15234.50, conversions: 234 },
        { name: 'Funnel Básico', revenue: 12345.00, conversions: 189 },
        { name: 'Funnel VIP', revenue: 9876.00, conversions: 156 }
      ],
      topButtons: [
        { name: 'Botão Premium', clicks: 1234, revenue: 5678.90 },
        { name: 'Botão Básico', clicks: 987, revenue: 4321.10 },
        { name: 'Botão VIP', clicks: 654, revenue: 3456.78 }
      ],
      recentActivity: [
        { type: 'transaction', description: 'PIX gerado para Funnel Premium', timestamp: new Date().toISOString() },
        { type: 'bot', description: 'Bot "Vendas" ativado', timestamp: new Date(Date.now() - 300000).toISOString() },
        { type: 'funnel', description: 'Funnel "VIP" criado', timestamp: new Date(Date.now() - 600000).toISOString() }
      ]
    };
    
    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter analytics overview:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/analytics/revenue - Dados de receita
router.get('/revenue', validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, granularity = 'day' } = req.query;
    
    logger.info('Solicitação de dados de receita', { startDate, endDate, granularity });
    
    // Dados simulados de receita
    const revenueData = {
      total: 45231.50,
      currency: 'BRL',
      period: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString()
      },
      breakdown: [
        { date: '2024-01-01', revenue: 1234.56, transactions: 45 },
        { date: '2024-01-02', revenue: 2345.67, transactions: 67 },
        { date: '2024-01-03', revenue: 3456.78, transactions: 89 },
        { date: '2024-01-04', revenue: 4567.89, transactions: 123 },
        { date: '2024-01-05', revenue: 5678.90, transactions: 156 }
      ],
      sources: [
        { name: 'Funnel Premium', revenue: 15234.50, percentage: 33.7 },
        { name: 'Funnel Básico', revenue: 12345.00, percentage: 27.3 },
        { name: 'Funnel VIP', revenue: 9876.00, percentage: 21.8 },
        { name: 'Outros', revenue: 7776.00, percentage: 17.2 }
      ]
    };
    
    res.json({
      success: true,
      data: revenueData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter dados de receita:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter dados de receita',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/analytics/funnels - Performance dos funis
router.get('/funnels', async (req, res) => {
  try {
    logger.info('Solicitação de performance dos funis');
    
    const funnelPerformance = [
      {
        id: '1',
        name: 'Funnel Premium',
        totalClicks: 1234,
        totalConversions: 234,
        conversionRate: 18.9,
        totalRevenue: 15234.50,
        averageOrderValue: 65.10,
        lastActivity: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Funnel Básico',
        totalClicks: 987,
        totalConversions: 189,
        conversionRate: 19.1,
        totalRevenue: 12345.00,
        averageOrderValue: 65.32,
        lastActivity: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        name: 'Funnel VIP',
        totalClicks: 654,
        totalConversions: 156,
        conversionRate: 23.9,
        totalRevenue: 9876.00,
        averageOrderValue: 63.31,
        lastActivity: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: funnelPerformance,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao obter performance dos funis:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao obter performance dos funis',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/analytics/bots - Status dos bots
router.get('/bots', async (req, res) => {
  try {
    logger.info('Solicitação de status dos bots');
    
    const botStatus = [
      {
        id: '1',
        name: 'Bot Vendas',
        status: 'active',
        messagesSent: 1234,
        conversations: 89,
        lastActivity: new Date().toISOString(),
        performance: 95.5
      },
      {
        id: '2',
        name: 'Bot Suporte',
        status: 'active',
        messagesSent: 567,
        conversations: 45,
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        performance: 87.2
      },
      {
        id: '3',
        name: 'Bot Marketing',
        status: 'inactive',
        messagesSent: 234,
        conversations: 23,
        lastActivity: new Date(Date.now() - 86400000).toISOString(),
        performance: 0
      }
    ];
    
    res.json({
      success: true,
      data: botStatus,
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

// POST /api/analytics/refresh - Forçar atualização dos analytics
router.post('/refresh', async (req, res) => {
  try {
    logger.info('Solicitação de refresh dos analytics');
    
    // Emitir evento WebSocket para atualização em tempo real
    emitAnalyticsUpdate({
      type: 'manual_refresh',
      message: 'Analytics atualizados manualmente',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Analytics atualizados com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao atualizar analytics:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao atualizar analytics',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/analytics/export - Exportar dados de analytics
router.get('/export', validateDateRange, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    logger.info('Solicitação de exportação de analytics', { startDate, endDate, format });
    
    if (format !== 'json' && format !== 'csv') {
      return res.status(400).json({
        error: 'Formato não suportado. Use "json" ou "csv"'
      });
    }
    
    // Aqui você implementaria a lógica real de exportação
    const exportData = {
      period: { startDate, endDate },
      format,
      data: {
        revenue: 45231.50,
        transactions: 1234,
        funnels: 12,
        bots: 5
      }
    };
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${startDate}-${endDate}.csv"`);
      
      // CSV simples para demonstração
      const csv = `Data,Receita,Transações\n${startDate},45231.50,1234\n${endDate},45231.50,1234`;
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    logger.error('Erro ao exportar analytics:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao exportar analytics',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as analyticsRoutes }; 