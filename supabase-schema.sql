-- Script para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de funis
CREATE TABLE IF NOT EXISTS funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  welcome_message TEXT NOT NULL,
  media_url TEXT,
  inline_buttons JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de bots
CREATE TABLE IF NOT EXISTS bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pix_api_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de usuários do Telegram (rastreamento de /start)
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL, -- ID do usuário no Telegram
  telegram_username TEXT, -- @username do usuário (opcional)
  telegram_first_name TEXT, -- Primeiro nome do usuário
  telegram_last_name TEXT, -- Último nome do usuário (opcional)
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL, -- Bot específico
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE NOT NULL, -- Funil associado
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Quando deu /start
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Última interação
  total_interactions INTEGER DEFAULT 1, -- Total de interações
  is_active BOOLEAN DEFAULT true, -- Se ainda está ativo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Proprietário do bot
  UNIQUE(telegram_user_id, bot_id) -- Um usuário só pode dar /start uma vez por bot
);

-- Habilitar RLS nas tabelas
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para funnels
CREATE POLICY "Users can view their own funnels" ON funnels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funnels" ON funnels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels" ON funnels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels" ON funnels
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para bots
CREATE POLICY "Users can view their own bots" ON bots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bots" ON bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots" ON bots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots" ON bots
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para configs
CREATE POLICY "Users can view their own configs" ON configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configs" ON configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs" ON configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs" ON configs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para telegram_users
CREATE POLICY "Users can view their own telegram users" ON telegram_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram users" ON telegram_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram users" ON telegram_users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram users" ON telegram_users
  FOR DELETE USING (auth.uid() = user_id);

-- Criar bucket para armazenamento de mídia
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de mídia
CREATE POLICY "Users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para permitir visualização de mídia
CREATE POLICY "Media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_funnels_updated_at 
  BEFORE UPDATE ON funnels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configs_updated_at 
  BEFORE UPDATE ON configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telegram_users_updated_at 
  BEFORE UPDATE ON telegram_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_funnels_created_at ON funnels(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_created_at ON bots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON configs(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_bot_id ON telegram_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_user_id ON telegram_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_started_at ON telegram_users(started_at DESC); 