-- Script para adicionar a tabela telegram_users ao Supabase
-- Execute este script no SQL Editor do Supabase

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

-- Habilitar RLS na tabela
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para telegram_users
CREATE POLICY "Users can view their own telegram users" ON telegram_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own telegram users" ON telegram_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own telegram users" ON telegram_users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own telegram users" ON telegram_users
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_telegram_users_updated_at 
  BEFORE UPDATE ON telegram_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_bot_id ON telegram_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_user_id ON telegram_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_started_at ON telegram_users(started_at DESC); 