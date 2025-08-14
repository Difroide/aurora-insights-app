export interface PixTransaction {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  botId: string;
  funnelId: string;
  buttonId: string;
  telegramUserId: number;
  pixId?: string;
  qrCode?: string;
  copyPasteKey?: string;
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  metadata: {
    buttonName: string;
    funnelName: string;
    botName: string;
    userFirstName: string;
    userUsername?: string;
  };
}

export interface BotInteraction {
  id: string;
  botId: string;
  telegramUserId: number;
  type: 'start' | 'button_click' | 'pix_generation' | 'pix_view' | 'pix_confirm';
  funnelId: string;
  buttonId?: string;
  metadata: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

export interface UserMetrics {
  telegramUserId: number;
  botId: string;
  funnelId: string;
  firstInteraction: Date;
  lastInteraction: Date;
  totalInteractions: number;
  totalPixGenerated: number;
  totalSpent: number;
  conversionRate: number;
  averageSessionDuration: number;
  isActive: boolean;
}

export interface RevenueData {
  date: Date;
  revenue: number;
  transactions: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  uniqueUsers: number;
  botId?: string;
  funnelId?: string;
}

export interface RealAnalyticsData {
  // Métricas principais (dados reais)
  totalRevenue: number;
  pendingRevenue: number;
  completedRevenue: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  activeBots: number;
  totalFunnels: number;
  totalButtons: number;
  uniqueUsers: number;
  conversionRate: number;
  averageTransactionValue: number;
  
  // Dados para gráficos (baseados em dados reais)
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    transactions: number;
    pendingAmount: number;
    completedAmount: number;
    uniqueUsers: number;
  }>;
  
  funnelPerformance: Array<{
    id: string;
    name: string;
    totalClicks: number;
    pixGenerated: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    averageValue: number;
  }>;
  
  botActivity: Array<{
    id: string;
    name: string;
    totalInteractions: number;
    uniqueUsers: number;
    pixGenerated: number;
    revenue: number;
    isActive: boolean;
    lastActivity: Date;
  }>;
  
  // Estatísticas de crescimento (comparação temporal real)
  revenueGrowth: {
    percentage: number;
    absolute: number;
    period: string;
  };
  
  userGrowth: {
    percentage: number;
    absolute: number;
    period: string;
  };
  
  transactionGrowth: {
    percentage: number;
    absolute: number;
    period: string;
  };
  
  // Dados recentes (transações reais)
  recentTransactions: PixTransaction[];
  
  // Top performers (baseado em dados reais)
  topFunnels: Array<{
    id: string;
    name: string;
    revenue: number;
    conversions: number;
    conversionRate: number;
  }>;
  
  topButtons: Array<{
    id: string;
    name: string;
    funnelName: string;
    clicks: number;
    revenue: number;
    conversions: number;
    conversionRate: number;
  }>;
  
  // Métricas de tempo real
  realTimeMetrics: {
    activeUsers: number;
    pendingTransactions: number;
    recentActivity: BotInteraction[];
    systemHealth: {
      pixApiStatus: 'healthy' | 'degraded' | 'down';
      databaseStatus: 'healthy' | 'degraded' | 'down';
      telegramApiStatus: 'healthy' | 'degraded' | 'down';
    };
  };
}

export interface AnalyticsFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  botIds?: string[];
  funnelIds?: string[];
  status?: PixTransaction['status'][];
  groupBy: 'day' | 'week' | 'month' | 'year';
}

export interface AnalyticsConfig {
  refreshInterval: number; // em milissegundos
  cacheTimeout: number; // em milissegundos
  realTimeEnabled: boolean;
  maxTransactionsInRecent: number;
  maxItemsInTopLists: number;
}