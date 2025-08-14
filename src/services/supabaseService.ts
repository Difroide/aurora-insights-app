import { supabase, Database, InlineButton } from '@/lib/supabase'

type Funnel = Database['public']['Tables']['funnels']['Row']
type Bot = Database['public']['Tables']['bots']['Row']
type Config = Database['public']['Tables']['configs']['Row']
type TelegramUser = Database['public']['Tables']['telegram_users']['Row']

export class SupabaseService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // ===== FUNNELS =====
  async getFunnels(): Promise<Funnel[]> {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar funis:', error)
      throw error
    }

    return data || []
  }

  async createFunnel(funnel: Omit<Funnel, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Funnel> {
    const { data, error } = await supabase
      .from('funnels')
      .insert({
        ...funnel,
        user_id: this.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar funil:', error)
      throw error
    }

    return data
  }

  async updateFunnel(id: string, updates: Partial<Omit<Funnel, 'id' | 'created_at' | 'user_id'>>): Promise<Funnel> {
    const { data, error } = await supabase
      .from('funnels')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar funil:', error)
      throw error
    }

    return data
  }

  async deleteFunnel(id: string): Promise<void> {
    const { error } = await supabase
      .from('funnels')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      console.error('Erro ao deletar funil:', error)
      throw error
    }
  }

  // ===== BOTS =====
  async getBots(): Promise<Bot[]> {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar bots:', error)
      throw error
    }

    return data || []
  }

  async createBot(bot: Omit<Bot, 'id' | 'created_at' | 'user_id'>): Promise<Bot> {
    const { data, error } = await supabase
      .from('bots')
      .insert({
        ...bot,
        user_id: this.userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar bot:', error)
      throw error
    }

    return data
  }

  async updateBot(id: string, updates: Partial<Omit<Bot, 'id' | 'created_at' | 'user_id'>>): Promise<Bot> {
    const { data, error } = await supabase
      .from('bots')
      .update(updates)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar bot:', error)
      throw error
    }

    return data
  }

  async deleteBot(id: string): Promise<void> {
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)

    if (error) {
      console.error('Erro ao deletar bot:', error)
      throw error
    }
  }

  // ===== CONFIGS =====
  async getConfig(): Promise<Config | null> {
    const { data, error } = await supabase
      .from('configs')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar configuração:', error)
      throw error
    }

    return data
  }

  async saveConfig(config: Omit<Config, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Config> {
    // Verificar se já existe uma configuração
    const existingConfig = await this.getConfig()

    if (existingConfig) {
      // Atualizar configuração existente
      const { data, error } = await supabase
        .from('configs')
        .update({
          pix_api_token: config.pix_api_token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar configuração:', error)
        throw error
      }

      return data
    } else {
      // Criar nova configuração
      const { data, error } = await supabase
        .from('configs')
        .insert({
          ...config,
          user_id: this.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar configuração:', error)
        throw error
      }

      return data
    }
  }

  // ===== TELEGRAM USERS =====
  async getTelegramUsers(botId?: string): Promise<TelegramUser[]> {
    let query = supabase
      .from('telegram_users')
      .select('*')
      .eq('user_id', this.userId)
      .order('started_at', { ascending: false })

    if (botId) {
      query = query.eq('bot_id', botId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar usuários do Telegram:', error)
      throw error
    }

    return data || []
  }

  async createTelegramUser(telegramUser: Omit<TelegramUser, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<TelegramUser> {
    const { data, error } = await supabase
      .from('telegram_users')
      .insert({
        ...telegramUser,
        user_id: this.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário do Telegram:', error)
      throw error
    }

    return data
  }

  async updateTelegramUser(id: string, updates: Partial<Omit<TelegramUser, 'id' | 'created_at' | 'user_id'>>): Promise<TelegramUser> {
    const { data, error } = await supabase
      .from('telegram_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar usuário do Telegram:', error)
      throw error
    }

    return data
  }

  async incrementTelegramUserInteractions(telegramUserId: number, botId: string): Promise<void> {
    const { error } = await supabase
      .from('telegram_users')
      .update({
        total_interactions: supabase.rpc('increment', { x: 1 }),
        last_interaction: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_user_id', telegramUserId)
      .eq('bot_id', botId)
      .eq('user_id', this.userId)

    if (error) {
      console.error('Erro ao incrementar interações do usuário:', error)
      throw error
    }
  }

  async getTelegramUserStats(botId?: string): Promise<{
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    newUsersThisWeek: number
  }> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    let baseQuery = supabase
      .from('telegram_users')
      .select('*')
      .eq('user_id', this.userId)

    if (botId) {
      baseQuery = baseQuery.eq('bot_id', botId)
    }

    const [totalResult, activeResult, todayResult, weekResult] = await Promise.all([
      baseQuery,
      baseQuery.eq('is_active', true),
      baseQuery.gte('started_at', today.toISOString()),
      baseQuery.gte('started_at', weekAgo.toISOString())
    ])

    if (totalResult.error) throw totalResult.error
    if (activeResult.error) throw activeResult.error
    if (todayResult.error) throw todayResult.error
    if (weekResult.error) throw weekResult.error

    return {
      totalUsers: totalResult.data?.length || 0,
      activeUsers: activeResult.data?.length || 0,
      newUsersToday: todayResult.data?.length || 0,
      newUsersThisWeek: weekResult.data?.length || 0
    }
  }

  // ===== UPLOAD DE MÍDIA =====
  async uploadMedia(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${this.userId}/${fileName}`

    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (error) {
      console.error('Erro ao fazer upload da mídia:', error)
      throw error
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Upload de arquivo para o Supabase Storage
  async uploadFile(file: File, folder: string = 'media'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${this.userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }

  // Deletar arquivo do Supabase Storage
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extrair o caminho do arquivo da URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-3).join('/'); // Pega os últimos 3 segmentos

      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar arquivo:', error);
        throw new Error(`Erro ao deletar arquivo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }
} 