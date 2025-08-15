import { createClient } from '@supabase/supabase-js'

// Temporariamente hardcoded para resolver o problema do Railway
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hllycihdvkcvhxjssevd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbHljaWhkdmtjdmh4anNzZXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzc2MzMsImV4cCI6MjA3MDY1MzYzM30.YxvgwgWXUFhzvVBcFoHmdDCdfUjFDr85-uEB1S_3eNk'

// Debug: Log das variáveis (remover depois)
console.log('🔍 Debug Supabase:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? 'PRESENT' : 'MISSING'
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey
  })
  console.warn('⚠️ Usando valores padrão do Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface InlineButton {
  id: string
  name: string
  value: string
  link: string
  generatePIX?: boolean
  pixData?: any
}

export interface Database {
  public: {
    Tables: {
      funnels: {
        Row: {
          id: string
          name: string
          welcome_message: string
          media_url: string | null
          inline_buttons: InlineButton[]
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          welcome_message: string
          media_url?: string | null
          inline_buttons?: InlineButton[]
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          welcome_message?: string
          media_url?: string | null
          inline_buttons?: InlineButton[]
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      bots: {
        Row: {
          id: string
          name: string
          token: string
          funnel_id: string
          is_active: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          token: string
          funnel_id: string
          is_active?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          token?: string
          funnel_id?: string
          is_active?: boolean
          created_at?: string
          user_id?: string
        }
      }
      configs: {
        Row: {
          id: string
          pix_api_token: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          pix_api_token: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          pix_api_token?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      telegram_users: {
        Row: {
          id: string
          telegram_user_id: number
          telegram_username: string | null
          telegram_first_name: string
          telegram_last_name: string | null
          bot_id: string
          funnel_id: string
          started_at: string
          last_interaction: string
          total_interactions: number
          is_active: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          telegram_user_id: number
          telegram_username?: string | null
          telegram_first_name: string
          telegram_last_name?: string | null
          bot_id: string
          funnel_id: string
          started_at?: string
          last_interaction?: string
          total_interactions?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          telegram_user_id?: number
          telegram_username?: string | null
          telegram_first_name?: string
          telegram_last_name?: string | null
          bot_id?: string
          funnel_id?: string
          started_at?: string
          last_interaction?: string
          total_interactions?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
} 