import { supabase } from '@/lib/supabase';
import { 
  RealAnalyticsData, 
  PixTransaction, 
  BotInteraction, 
  UserMetrics, 
  RevenueData,
  AnalyticsFilters,
  AnalyticsConfig
} from '@/types/analytics';
import { addDays, subDays, format, startOfDay, endOfDay } from 'date-fns';

class AnalyticsService {
  private config: AnalyticsConfig = {
    refreshInterval: 60000, // 1 minuto
    cacheTimeout: 300000, // 5 minutos
    realTimeEnabled: true,
    maxTransactionsInRecent: 20,
    maxItemsInTopLists: 10
  };

  private cache = new Map<string, { data: any; timestamp: number }>();

  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.config.cacheTimeout;
  }

  private setCache(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  private getCache<T>(cacheKey: string): T | null {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }

  async getRealAnalytics(
    userId: string, 
    filters: AnalyticsFilters
  ): Promise<RealAnalyticsData> {
    const cacheKey = this.getCacheKey('getRealAnalytics', { userId, filters });
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache<RealAnalyticsData>(cacheKey)!;
    }

    try {
      // Buscar dados em paralelo para otimizar performance
      const [
        pixTransactions,
        botInteractions,
        userMetrics,
        botsData,
        funnelsData
      ] = await Promise.all([
        this.getPixTransactions(userId, filters),
        this.getBotInteractions(userId, filters),
        this.getUserMetrics(userId, filters),
        this.getBotsData(userId),
        this.getFunnelsData(userId)
      ]);

      // Calcular métricas principais
      const mainMetrics = this.calculateMainMetrics(pixTransactions, botInteractions, userMetrics);
      
      // Calcular dados para gráficos
      const chartData = this.calculateChartData(pixTransactions, filters);
      
      // Calcular performance de funis e bots
      const performance = this.calculatePerformanceMetrics(
        pixTransactions, 
        botInteractions, 
        funnelsData, 
        botsData
      );
      
      // Calcular crescimento
      const growthMetrics = await this.calculateGrowthMetrics(userId, filters);
      
      // Obter dados recentes
      const recentData = this.getRecentData(pixTransactions, botInteractions);
      
      // Métricas em tempo real
      const realTimeMetrics = await this.getRealTimeMetrics(userId);

      const analytics: RealAnalyticsData = {
        ...mainMetrics,
        ...chartData,
        ...performance,
        ...growthMetrics,
        ...recentData,
        realTimeMetrics
      };

      this.setCache(cacheKey, analytics);
      return analytics;

    } catch (error) {
      console.error('Erro ao buscar analytics reais:', error);
      throw new Error('Falha ao carregar dados de analytics');
    }
  }

  private async getPixTransactions(
    userId: string, 
    filters: AnalyticsFilters
  ): Promise<PixTransaction[]> {
    const { data, error } = await supabase
      .from('pix_transactions')
      .select(`
        *,
        bots!inner(name, user_id),
        funnels!inner(name),
        telegram_users!inner(telegram_first_name, telegram_username)
      `)
      .eq('bots.user_id', userId)
      .gte('created_at', filters.dateRange.start.toISOString())
      .lte('created_at', filters.dateRange.end.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transações PIX:', error);
      return [];
    }

    return (data || []).map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      botId: transaction.bot_id,
      funnelId: transaction.funnel_id,
      buttonId: transaction.button_id,
      telegramUserId: transaction.telegram_user_id,
      pixId: transaction.pix_id,
      qrCode: transaction.qr_code,
      copyPasteKey: transaction.copy_paste_key,
      createdAt: new Date(transaction.created_at),
      completedAt: transaction.completed_at ? new Date(transaction.completed_at) : undefined,
      failedAt: transaction.failed_at ? new Date(transaction.failed_at) : undefined,
      metadata: {
        buttonName: transaction.button_name || '',
        funnelName: transaction.funnels?.name || '',
        botName: transaction.bots?.name || '',
        userFirstName: transaction.telegram_users?.telegram_first_name || '',
        userUsername: transaction.telegram_users?.telegram_username
      }
    }));
  }

  private async getBotInteractions(
    userId: string, 
    filters: AnalyticsFilters
  ): Promise<BotInteraction[]> {
    const { data, error } = await supabase
      .from('bot_interactions')
      .select(`
        *,
        bots!inner(user_id)
      `)
      .eq('bots.user_id', userId)
      .gte('timestamp', filters.dateRange.start.toISOString())
      .lte('timestamp', filters.dateRange.end.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interações:', error);
      return [];
    }

    return (data || []).map(interaction => ({
      id: interaction.id,
      botId: interaction.bot_id,
      telegramUserId: interaction.telegram_user_id,
      type: interaction.type,
      funnelId: interaction.funnel_id,
      buttonId: interaction.button_id,
      metadata: interaction.metadata || {},
      timestamp: new Date(interaction.timestamp),
      sessionId: interaction.session_id
    }));
  }

  private async getUserMetrics(
    userId: string, 
    filters: AnalyticsFilters
  ): Promise<UserMetrics[]> {
    const { data, error } = await supabase
      .from('telegram_users')
      .select(`
        *,
        bots!inner(user_id)
      `)
      .eq('bots.user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Erro ao buscar métricas de usuários:', error);
      return [];
    }

    return (data || []).map(user => ({
      telegramUserId: user.telegram_user_id,
      botId: user.bot_id,
      funnelId: user.funnel_id,
      firstInteraction: new Date(user.started_at),
      lastInteraction: new Date(user.last_interaction),
      totalInteractions: user.total_interactions || 0,
      totalPixGenerated: 0, // Será calculado posteriormente
      totalSpent: 0, // Será calculado posteriormente
      conversionRate: 0, // Será calculado posteriormente
      averageSessionDuration: 0, // Será calculado posteriormente
      isActive: user.is_active
    }));
  }

  private async getBotsData(userId: string) {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar dados dos bots:', error);
      return [];
    }

    return data || [];
  }

  private async getFunnelsData(userId: string) {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao buscar dados dos funis:', error);
      return [];
    }

    return data || [];
  }

  private calculateMainMetrics(
    transactions: PixTransaction[],
    interactions: BotInteraction[],
    users: UserMetrics[]
  ) {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const failedTransactions = transactions.filter(t => t.status === 'failed');

    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingRevenue = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    const completedRevenue = totalRevenue;

    const uniqueUsers = new Set(interactions.map(i => i.telegramUserId)).size;
    const pixGenerations = interactions.filter(i => i.type === 'pix_generation').length;
    const buttonClicks = interactions.filter(i => i.type === 'button_click').length;

    const conversionRate = buttonClicks > 0 ? (pixGenerations / buttonClicks) * 100 : 0;
    const averageTransactionValue = transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
      : 0;

    return {
      totalRevenue,
      pendingRevenue,
      completedRevenue,
      totalTransactions: transactions.length,
      pendingTransactions: pendingTransactions.length,
      completedTransactions: completedTransactions.length,
      failedTransactions: failedTransactions.length,
      activeBots: 0, // Será calculado posteriormente
      totalFunnels: 0, // Será calculado posteriormente
      totalButtons: 0, // Será calculado posteriormente
      uniqueUsers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100
    };
  }

  private calculateChartData(transactions: PixTransaction[], filters: AnalyticsFilters) {
    const groupedData = new Map<string, {
      revenue: number;
      transactions: number;
      pendingAmount: number;
      completedAmount: number;
      uniqueUsers: Set<number>;
    }>();

    transactions.forEach(transaction => {
      let periodKey: string;
      const date = transaction.createdAt;

      switch (filters.groupBy) {
        case 'day':
          periodKey = format(date, 'dd/MM');
          break;
        case 'week':
          periodKey = `Sem ${Math.ceil(date.getDate() / 7)}`;
          break;
        case 'month':
          periodKey = format(date, 'MMM');
          break;
        case 'year':
          periodKey = format(date, 'yyyy');
          break;
        default:
          periodKey = format(date, 'dd/MM');
      }

      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, {
          revenue: 0,
          transactions: 0,
          pendingAmount: 0,
          completedAmount: 0,
          uniqueUsers: new Set()
        });
      }

      const group = groupedData.get(periodKey)!;
      group.transactions += 1;
      group.uniqueUsers.add(transaction.telegramUserId);

      if (transaction.status === 'completed') {
        group.completedAmount += transaction.amount;
        group.revenue += transaction.amount;
      } else if (transaction.status === 'pending') {
        group.pendingAmount += transaction.amount;
      }
    });

    const revenueByPeriod = Array.from(groupedData.entries()).map(([period, data]) => ({
      period,
      revenue: Math.round(data.revenue * 100) / 100,
      transactions: data.transactions,
      pendingAmount: Math.round(data.pendingAmount * 100) / 100,
      completedAmount: Math.round(data.completedAmount * 100) / 100,
      uniqueUsers: data.uniqueUsers.size
    }));

    return { revenueByPeriod };
  }

  private calculatePerformanceMetrics(
    transactions: PixTransaction[],
    interactions: BotInteraction[],
    funnels: any[],
    bots: any[]
  ) {
    // Performance dos funis
    const funnelPerformance = funnels.map(funnel => {
      const funnelTransactions = transactions.filter(t => t.funnelId === funnel.id);
      const funnelInteractions = interactions.filter(i => i.funnelId === funnel.id);
      
      const totalClicks = funnelInteractions.filter(i => i.type === 'button_click').length;
      const pixGenerated = funnelInteractions.filter(i => i.type === 'pix_generation').length;
      const conversions = funnelTransactions.filter(t => t.status === 'completed').length;
      const revenue = funnelTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;
      const averageValue = conversions > 0 ? revenue / conversions : 0;

      return {
        id: funnel.id,
        name: funnel.name,
        totalClicks,
        pixGenerated,
        conversions,
        revenue: Math.round(revenue * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageValue: Math.round(averageValue * 100) / 100
      };
    });

    // Atividade dos bots
    const botActivity = bots.map(bot => {
      const botInteractions = interactions.filter(i => i.botId === bot.id);
      const botTransactions = transactions.filter(t => t.botId === bot.id);
      
      const uniqueUsers = new Set(botInteractions.map(i => i.telegramUserId)).size;
      const pixGenerated = botInteractions.filter(i => i.type === 'pix_generation').length;
      const revenue = botTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastActivity = botInteractions.length > 0 
        ? new Date(Math.max(...botInteractions.map(i => i.timestamp.getTime())))
        : new Date(bot.created_at);

      return {
        id: bot.id,
        name: bot.name,
        totalInteractions: botInteractions.length,
        uniqueUsers,
        pixGenerated,
        revenue: Math.round(revenue * 100) / 100,
        isActive: bot.is_active,
        lastActivity
      };
    });

    return { funnelPerformance, botActivity };
  }

  private async calculateGrowthMetrics(userId: string, filters: AnalyticsFilters) {
    const currentPeriod = filters.dateRange;
    const previousPeriodStart = subDays(currentPeriod.start, 
      Math.ceil((currentPeriod.end.getTime() - currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24))
    );
    const previousPeriodEnd = subDays(currentPeriod.end,
      Math.ceil((currentPeriod.end.getTime() - currentPeriod.start.getTime()) / (1000 * 60 * 60 * 24))
    );

    const previousFilters = {
      ...filters,
      dateRange: { start: previousPeriodStart, end: previousPeriodEnd }
    };

    try {
      const [currentTransactions, previousTransactions] = await Promise.all([
        this.getPixTransactions(userId, filters),
        this.getPixTransactions(userId, previousFilters)
      ]);

      const currentRevenue = currentTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const previousRevenue = previousTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const currentUsers = new Set(currentTransactions.map(t => t.telegramUserId)).size;
      const previousUsers = new Set(previousTransactions.map(t => t.telegramUserId)).size;

      const currentTransactionCount = currentTransactions.length;
      const previousTransactionCount = previousTransactions.length;

      const revenueGrowth = {
        percentage: previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
          : currentRevenue > 0 ? 100 : 0,
        absolute: currentRevenue - previousRevenue,
        period: 'vs período anterior'
      };

      const userGrowth = {
        percentage: previousUsers > 0 
          ? ((currentUsers - previousUsers) / previousUsers) * 100 
          : currentUsers > 0 ? 100 : 0,
        absolute: currentUsers - previousUsers,
        period: 'vs período anterior'
      };

      const transactionGrowth = {
        percentage: previousTransactionCount > 0 
          ? ((currentTransactionCount - previousTransactionCount) / previousTransactionCount) * 100 
          : currentTransactionCount > 0 ? 100 : 0,
        absolute: currentTransactionCount - previousTransactionCount,
        period: 'vs período anterior'
      };

      return {
        revenueGrowth: {
          ...revenueGrowth,
          percentage: Math.round(revenueGrowth.percentage * 100) / 100
        },
        userGrowth: {
          ...userGrowth,
          percentage: Math.round(userGrowth.percentage * 100) / 100
        },
        transactionGrowth: {
          ...transactionGrowth,
          percentage: Math.round(transactionGrowth.percentage * 100) / 100
        }
      };
    } catch (error) {
      console.error('Erro ao calcular métricas de crescimento:', error);
      return {
        revenueGrowth: { percentage: 0, absolute: 0, period: 'vs período anterior' },
        userGrowth: { percentage: 0, absolute: 0, period: 'vs período anterior' },
        transactionGrowth: { percentage: 0, absolute: 0, period: 'vs período anterior' }
      };
    }
  }

  private getRecentData(transactions: PixTransaction[], interactions: BotInteraction[]) {
    const recentTransactions = transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, this.config.maxTransactionsInRecent);

    // Agrupar por funnel para top funnels
    const funnelRevenue = new Map<string, { name: string; revenue: number; conversions: number }>();
    transactions.filter(t => t.status === 'completed').forEach(transaction => {
      const key = transaction.funnelId;
      if (!funnelRevenue.has(key)) {
        funnelRevenue.set(key, {
          name: transaction.metadata.funnelName,
          revenue: 0,
          conversions: 0
        });
      }
      const funnel = funnelRevenue.get(key)!;
      funnel.revenue += transaction.amount;
      funnel.conversions += 1;
    });

    const topFunnels = Array.from(funnelRevenue.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        revenue: Math.round(data.revenue * 100) / 100,
        conversions: data.conversions,
        conversionRate: 0 // Seria necessário dados de cliques totais
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, this.config.maxItemsInTopLists);

    // Agrupar por botão para top buttons
    const buttonMetrics = new Map<string, { 
      name: string; 
      funnelName: string; 
      clicks: number; 
      revenue: number; 
      conversions: number 
    }>();

    interactions.filter(i => i.type === 'button_click').forEach(interaction => {
      const key = interaction.buttonId || 'unknown';
      if (!buttonMetrics.has(key)) {
        buttonMetrics.set(key, {
          name: 'Botão',
          funnelName: '',
          clicks: 0,
          revenue: 0,
          conversions: 0
        });
      }
      buttonMetrics.get(key)!.clicks += 1;
    });

    transactions.filter(t => t.status === 'completed').forEach(transaction => {
      const key = transaction.buttonId;
      if (buttonMetrics.has(key)) {
        const button = buttonMetrics.get(key)!;
        button.revenue += transaction.amount;
        button.conversions += 1;
        button.name = transaction.metadata.buttonName;
        button.funnelName = transaction.metadata.funnelName;
      }
    });

    const topButtons = Array.from(buttonMetrics.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        funnelName: data.funnelName,
        clicks: data.clicks,
        revenue: Math.round(data.revenue * 100) / 100,
        conversions: data.conversions,
        conversionRate: data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, this.config.maxItemsInTopLists);

    return { recentTransactions, topFunnels, topButtons };
  }

  private async getRealTimeMetrics(userId: string) {
    try {
      // Buscar usuários ativos nas últimas 24h
      const last24h = subDays(new Date(), 1);
      
      const { data: activeInteractions } = await supabase
        .from('bot_interactions')
        .select(`
          *,
          bots!inner(user_id)
        `)
        .eq('bots.user_id', userId)
        .gte('timestamp', last24h.toISOString());

      const activeUsers = new Set(
        (activeInteractions || []).map(i => i.telegram_user_id)
      ).size;

      // Buscar transações pendentes
      const { data: pendingTx } = await supabase
        .from('pix_transactions')
        .select(`
          *,
          bots!inner(user_id)
        `)
        .eq('bots.user_id', userId)
        .eq('status', 'pending');

      const pendingTransactions = (pendingTx || []).length;

      // Atividade recente (últimas 10 interações)
      const recentActivity = (activeInteractions || [])
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)
        .map(interaction => ({
          id: interaction.id,
          botId: interaction.bot_id,
          telegramUserId: interaction.telegram_user_id,
          type: interaction.type,
          funnelId: interaction.funnel_id,
          buttonId: interaction.button_id,
          metadata: interaction.metadata || {},
          timestamp: new Date(interaction.timestamp),
          sessionId: interaction.session_id
        }));

      // Status dos sistemas (simulado - seria necessário implementar health checks reais)
      const systemHealth = {
        pixApiStatus: 'healthy' as const,
        databaseStatus: 'healthy' as const,
        telegramApiStatus: 'healthy' as const
      };

      return {
        activeUsers,
        pendingTransactions,
        recentActivity,
        systemHealth
      };
    } catch (error) {
      console.error('Erro ao buscar métricas em tempo real:', error);
      return {
        activeUsers: 0,
        pendingTransactions: 0,
        recentActivity: [],
        systemHealth: {
          pixApiStatus: 'down' as const,
          databaseStatus: 'down' as const,
          telegramApiStatus: 'down' as const
        }
      };
    }
  }

  // Métodos para tracking de eventos
  async trackPixTransaction(transaction: Omit<PixTransaction, 'id' | 'createdAt'>) {
    try {
      const { error } = await supabase
        .from('pix_transactions')
        .insert({
          amount: transaction.amount,
          status: transaction.status,
          bot_id: transaction.botId,
          funnel_id: transaction.funnelId,
          button_id: transaction.buttonId,
          telegram_user_id: transaction.telegramUserId,
          pix_id: transaction.pixId,
          qr_code: transaction.qrCode,
          copy_paste_key: transaction.copyPasteKey,
          button_name: transaction.metadata.buttonName,
          completed_at: transaction.completedAt?.toISOString(),
          failed_at: transaction.failedAt?.toISOString()
        });

      if (error) {
        console.error('Erro ao rastrear transação PIX:', error);
      }
    } catch (error) {
      console.error('Erro ao rastrear transação PIX:', error);
    }
  }

  async trackBotInteraction(interaction: Omit<BotInteraction, 'id'>) {
    try {
      const { error } = await supabase
        .from('bot_interactions')
        .insert({
          bot_id: interaction.botId,
          telegram_user_id: interaction.telegramUserId,
          type: interaction.type,
          funnel_id: interaction.funnelId,
          button_id: interaction.buttonId,
          metadata: interaction.metadata,
          timestamp: interaction.timestamp.toISOString(),
          session_id: interaction.sessionId
        });

      if (error) {
        console.error('Erro ao rastrear interação:', error);
      }
    } catch (error) {
      console.error('Erro ao rastrear interação:', error);
    }
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Configurar parâmetros
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const analyticsService = new AnalyticsService();