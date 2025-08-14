import { useMemo } from 'react';
import { useFunnels } from './useFunnels';
import { useTelegramUsers } from './useTelegramUsers';

export interface AnalyticsData {
  // Métricas principais
  totalRevenue: number;
  totalTransactions: number;
  activeBots: number;
  totalFunnels: number;
  totalButtons: number;
  conversionRate: number;
  
  // Dados para gráficos
  revenueByMonth: Array<{ month: string; revenue: number; transactions: number }>;
  funnelPerformance: Array<{ name: string; clicks: number; conversions: number; revenue: number }>;
  botActivity: Array<{ name: string; messages: number; active: boolean }>;
  
  // Estatísticas de crescimento
  revenueGrowth: number;
  userGrowth: number;
  transactionGrowth: number;
  
  // Dados recentes
  recentTransactions: Array<{
    id: string;
    value: number;
    funnel: string;
    date: Date;
    status: string;
  }>;
  
  // Top performers
  topFunnels: Array<{ name: string; revenue: number; conversions: number }>;
  topButtons: Array<{ name: string; clicks: number; revenue: number }>;
}

export const useAnalytics = () => {
  const { funnels, loading: funnelsLoading } = useFunnels();
  const { stats: telegramStats, loading: telegramLoading } = useTelegramUsers();

  const analytics = useMemo(() => {
    if (funnelsLoading || telegramLoading) return null;
    
    // Se não há dados, retornar estrutura vazia mas válida
    if (!funnels || funnels.length === 0) {
      return {
        // Métricas principais
        totalRevenue: 0,
        totalTransactions: 0,
        activeBots: 0,
        totalFunnels: 0,
        totalButtons: 0,
        conversionRate: 0,
        
        // Dados para gráficos
        revenueByMonth: [],
        funnelPerformance: [],
        botActivity: [],
        
        // Estatísticas de crescimento
        revenueGrowth: 0,
        userGrowth: 0,
        transactionGrowth: 0,
        
        // Dados recentes
        recentTransactions: [],
        
        // Top performers
        topFunnels: [],
        topButtons: []
      };
    }

    // Calcular métricas básicas
    const totalFunnels = funnels.length;
    const totalButtons = funnels.reduce((acc, funnel) => acc + funnel.inlineButtons.length, 0);
    
    // Calcular receita total (simulado baseado nos valores dos botões)
    const totalRevenue = funnels.reduce((acc, funnel) => {
      return acc + funnel.inlineButtons.reduce((buttonAcc, button) => {
        const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
        const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
        return buttonAcc + value;
      }, 0);
    }, 0);

    // Calcular transações (simulado - 1 por botão com PIX)
    const totalTransactions = funnels.reduce((acc, funnel) => {
      return acc + funnel.inlineButtons.filter(button => button.generatePIX).length;
    }, 0);

    // Calcular taxa de conversão (simulado)
    const conversionRate = totalButtons > 0 ? (totalTransactions / totalButtons) * 100 : 0;

    // Dados de performance dos funis
    const funnelPerformance = funnels.map(funnel => {
      const buttonClicks = funnel.inlineButtons.length; // Simulado
      const conversions = funnel.inlineButtons.filter(button => button.generatePIX).length;
      const revenue = funnel.inlineButtons.reduce((acc, button) => {
        const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
        const value = valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
        return acc + value;
      }, 0);

      return {
        name: funnel.name,
        clicks: buttonClicks,
        conversions,
        revenue
      };
    });

    // Dados de atividade dos bots (simulado)
    const botActivity = funnels.map(funnel => ({
      name: `Bot do ${funnel.name}`,
      messages: Math.floor(Math.random() * 100) + 10, // Simulado
      active: true
    }));

    // Dados de receita por mês (simulado)
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const revenueByMonth = [{
      month: currentMonth,
      revenue: totalRevenue,
      transactions: totalTransactions
    }];

    // Top funis
    const topFunnels = funnelPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top botões
    const topButtons = funnels.flatMap(funnel => 
      funnel.inlineButtons.map(button => ({
        name: button.name,
        clicks: Math.floor(Math.random() * 50) + 5, // Simulado
        revenue: (() => {
          const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
          return valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
        })()
      }))
    ).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Transações recentes (simulado)
    const recentTransactions = funnels.flatMap(funnel =>
      funnel.inlineButtons
        .filter(button => button.generatePIX)
        .map(button => ({
          id: `tx_${funnel.id}_${button.id}`,
          value: (() => {
            const valueMatch = button.value.match(/(\d+[.,]\d+|\d+)/);
            return valueMatch ? parseFloat(valueMatch[1].replace(',', '.')) : 0;
          })(),
          funnel: funnel.name,
          date: new Date(),
          status: 'completed'
        }))
    ).slice(0, 10);

    return {
      // Métricas principais
      totalRevenue,
      totalTransactions,
      activeBots: botActivity.length,
      totalFunnels,
      totalButtons,
      conversionRate,
      
      // Dados para gráficos
      revenueByMonth,
      funnelPerformance,
      botActivity,
      
      // Estatísticas de crescimento (simulado)
      revenueGrowth: 15.5,
      userGrowth: 8.2,
      transactionGrowth: 12.7,
      
      // Dados recentes
      recentTransactions,
      
      // Top performers
      topFunnels,
      topButtons
    };
  }, [funnels, telegramStats, funnelsLoading, telegramLoading]);

  return {
    analytics,
    loading: funnelsLoading || telegramLoading
  };
}; 