import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useToast } from './use-toast';

export interface Bot {
  id: string;
  name: string;
  token: string;
  funnelId: string;
  status: "Ativo" | "Pausado";
  messages: number;
  conversions: number;
  lastActive: string;
  performance: number;
  createdAt: Date;
}

export const useBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const { toast } = useToast();

  // Carregar bots do Supabase
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      setLoading(true);
      const data = await supabase.getBots();
      
      // Converter dados do Supabase para o formato local
      const botsWithDates = (data || []).map((bot) => ({
        id: bot.id,
        name: bot.name,
        token: bot.token,
        funnelId: bot.funnel_id,
        status: bot.is_active ? "Ativo" as const : "Pausado" as const,
        messages: 0, // TODO: Implementar contagem de mensagens
        conversions: 0, // TODO: Implementar contagem de conversões
        lastActive: "Agora", // TODO: Implementar último ativo
        performance: 100, // TODO: Implementar performance
        createdAt: new Date(bot.created_at)
      }));
      
      setBots(botsWithDates);
    } catch (error) {
      console.error('Erro ao carregar bots:', error);
      
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
          description: "Erro ao carregar bots do banco de dados",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo bot
  const addBot = async (bot: Omit<Bot, 'id' | 'createdAt'>) => {
    try {
      const newBot = await supabase.createBot({
        name: bot.name,
        token: bot.token,
        funnel_id: bot.funnelId,
        is_active: bot.status === "Ativo"
      });

      const botWithDates: Bot = {
        id: newBot.id,
        name: newBot.name,
        token: newBot.token,
        funnelId: newBot.funnel_id,
        status: newBot.is_active ? "Ativo" as const : "Pausado" as const,
        messages: 0,
        conversions: 0,
        lastActive: "Agora",
        performance: 100,
        createdAt: new Date(newBot.created_at)
      };

      setBots(prev => [botWithDates, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Bot criado com sucesso!",
      });

      return botWithDates;
    } catch (error) {
      console.error('Erro ao criar bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bot",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar bot existente
  const updateBot = async (id: string, updates: Partial<Omit<Bot, 'id' | 'createdAt'>>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.token !== undefined) supabaseUpdates.token = updates.token;
      if (updates.funnelId !== undefined) supabaseUpdates.funnel_id = updates.funnelId;
      if (updates.status !== undefined) supabaseUpdates.is_active = updates.status === "Ativo";

      await supabase.updateBot(id, supabaseUpdates);

      setBots(prev => prev.map(bot =>
        bot.id === id
          ? { ...bot, ...updates }
          : bot
      ));

      toast({
        title: "Sucesso",
        description: "Bot atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar bot",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Remover bot
  const removeBot = async (id: string) => {
    try {
      await supabase.deleteBot(id);
      setBots(prev => prev.filter(bot => bot.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Bot removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover bot:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover bot",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Buscar bot por ID
  const getBotById = (id: string) => {
    return bots.find(bot => bot.id === id);
  };

  // Alternar status do bot
  const toggleBotStatus = async (id: string) => {
    const bot = getBotById(id);
    if (!bot) return;

    const newStatus = bot.status === "Ativo" ? "Pausado" as const : "Ativo" as const;
    await updateBot(id, { status: newStatus });
  };

  return {
    bots,
    loading,
    addBot,
    updateBot,
    removeBot,
    getBotById,
    toggleBotStatus,
    refreshBots: loadBots
  };
}; 