import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET /api/funnels - Listar funis
router.get('/', async (req, res) => {
  try {
    logger.info('Solicitação para listar funis');
    
    // Por enquanto, retornamos dados simulados
    const funnels = [
      {
        id: '1',
        name: 'Funnel Premium',
        description: 'Funnel para produtos premium',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Funnel Básico',
        description: 'Funnel para produtos básicos',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: funnels,
      total: funnels.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao listar funis:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao listar funis',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/funnels - Criar funil
router.post('/', async (req, res) => {
  try {
    const funnelData = req.body;
    
    logger.info('Solicitação para criar funil', { name: funnelData.name });
    
    // Por enquanto, simulamos a criação
    const newFunnel = {
      id: Date.now().toString(),
      name: funnelData.name,
      description: funnelData.description || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      data: newFunnel,
      message: 'Funil criado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao criar funil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao criar funil',
      timestamp: new Date().toISOString()
    });
  }
});

// PUT /api/funnels/:id - Atualizar funil
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info('Solicitação para atualizar funil', { funnelId: id });
    
    // Por enquanto, simulamos a atualização
    const updatedFunnel = {
      id,
      name: updates.name || 'Funnel Atualizado',
      description: updates.description || '',
      status: updates.status || 'active',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedFunnel,
      message: 'Funil atualizado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao atualizar funil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao atualizar funil',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/funnels/:id - Remover funil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Solicitação para remover funil', { funnelId: id });
    
    // Por enquanto, simulamos a remoção
    res.json({
      success: true,
      message: 'Funil removido com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro ao remover funil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor ao remover funil',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as funnelRoutes }; 