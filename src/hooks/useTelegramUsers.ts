import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useToast } from './use-toast';

export interface TelegramUser {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string;
  telegram_last_name: string | null;
  bot_id: string;
  funnel_id: string;
  started_at: string;
  last_interaction: string;
  total_interactions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TelegramUserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export const useTelegramUsers = (botId?: string) => {
  const [users, setUsers] = useState<TelegramUser[]>([]);
  const [stats, setStats] = useState<TelegramUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const { toast } = useToast();

  // Carregar usuários do Telegram
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [botId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await supabase.getTelegramUsers();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários do Telegram:', error);
      
      // Verificar se é erro de conectividade
      const isNetworkError = error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_NETWORK')
      );
      
      if (isNetworkError) {
        toast({
          title: "Erro de Conectividade",
          description: "Verifique sua conexão com a internet e tente novamente",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar usuários do Telegram",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await supabase.getTelegramUserStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      
      // Verificar se é erro de conectividade
      const isNetworkError = error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('ERR_NETWORK')
      );
      
      if (isNetworkError) {
        toast({
          title: "Erro de Conectividade",
          description: "Verifique sua conexão com a internet e tente novamente",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar estatísticas",
          variant: "destructive"
        });
      }
    }
  };

  const updateUser = async (id: string, updates: Partial<TelegramUser>) => {
    try {
      await supabase.updateTelegramUser(id, updates);
      await loadUsers(); // Recarregar lista
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar usuário",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    await Promise.all([loadUsers(), loadStats()]);
  };

  return {
    users,
    stats,
    loading,
    updateUser,
    refreshData,
    loadUsers,
    loadStats
  };
}; 