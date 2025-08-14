import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useToast } from './use-toast';

export interface PIXData {
  id: string;
  value: number;
  qr_code: string;
  qr_code_text: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export interface Orderbump {
  id: string;
  mediaUrl?: string;
  title: string;
  acceptText: string;
  rejectText: string;
  value: string;
  messageAfterPayment: string;
}

export interface InlineButton {
  id: string;
  name: string;
  value: string;
  link: string;
  generatePIX: boolean;
  pixData?: PIXData;
  orderbump?: Orderbump;
}

export interface Funnel {
  id: string;
  name: string;
  mediaUrl?: string;
  welcomeMessage: string;
  inlineButtons: InlineButton[];
  createdAt: Date;
  updatedAt: Date;
}

export const useFunnels = () => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const { toast } = useToast();

  // Carregar funis do Supabase
  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const data = await supabase.getFunnels();
      
      // Converter dados do Supabase para o formato local
      const funnelsWithDates = data.map((funnel) => ({
        id: funnel.id,
        name: funnel.name,
        mediaUrl: funnel.media_url || undefined,
        welcomeMessage: funnel.welcome_message,
        inlineButtons: funnel.inline_buttons as InlineButton[],
        createdAt: new Date(funnel.created_at),
        updatedAt: new Date(funnel.updated_at)
        }));
      
        setFunnels(funnelsWithDates);
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
      
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
          description: "Erro ao carregar funis do banco de dados",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Adicionar novo funil
  const addFunnel = async (funnel: Omit<Funnel, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newFunnel = await supabase.createFunnel({
        name: funnel.name,
        welcome_message: funnel.welcomeMessage,
        media_url: funnel.mediaUrl || null,
        inline_buttons: funnel.inlineButtons
      });

      const funnelWithDates: Funnel = {
        id: newFunnel.id,
        name: newFunnel.name,
        mediaUrl: newFunnel.media_url || undefined,
        welcomeMessage: newFunnel.welcome_message,
        inlineButtons: newFunnel.inline_buttons as InlineButton[],
        createdAt: new Date(newFunnel.created_at),
        updatedAt: new Date(newFunnel.updated_at)
      };

      setFunnels(prev => [funnelWithDates, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Funil criado com sucesso!",
      });

      return funnelWithDates;
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar funil",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar funil existente
  const updateFunnel = async (id: string, updates: Partial<Omit<Funnel, 'id' | 'createdAt'>>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.welcomeMessage !== undefined) supabaseUpdates.welcome_message = updates.welcomeMessage;
      if (updates.mediaUrl !== undefined) supabaseUpdates.media_url = updates.mediaUrl || null;
      if (updates.inlineButtons !== undefined) supabaseUpdates.inline_buttons = updates.inlineButtons;

      await supabase.updateFunnel(id, supabaseUpdates);

      setFunnels(prev => prev.map(funnel =>
        funnel.id === id
          ? { ...funnel, ...updates, updatedAt: new Date() }
          : funnel
      ));

      toast({
        title: "Sucesso",
        description: "Funil atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar funil",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Remover funil
  const removeFunnel = async (id: string) => {
    try {
      await supabase.deleteFunnel(id);
      setFunnels(prev => prev.filter(funnel => funnel.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Funil removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover funil:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funil",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Buscar funil por ID
  const getFunnelById = (id: string) => {
    return funnels.find(funnel => funnel.id === id);
  };

  // Atualizar dados PIX de um botão específico
  const updateButtonPIX = async (funnelId: string, buttonId: string, pixData: PIXData) => {
    try {
      const funnel = getFunnelById(funnelId);
      if (!funnel) throw new Error('Funil não encontrado');

      const updatedButtons = funnel.inlineButtons.map(btn =>
        btn.id === buttonId
          ? { ...btn, pixData, generatePIX: true }
          : btn
      );

      await updateFunnel(funnelId, { inlineButtons: updatedButtons });
    } catch (error) {
      console.error('Erro ao atualizar PIX do botão:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados PIX",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    funnels,
    loading,
    addFunnel,
    updateFunnel,
    removeFunnel,
    getFunnelById,
    updateButtonPIX,
    refreshFunnels: loadFunnels
  };
}; 