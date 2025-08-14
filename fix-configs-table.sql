-- Script para corrigir a tabela configs no Supabase
-- Execute este script no SQL Editor do Supabase

-- Remover a constraint UNIQUE da tabela configs
ALTER TABLE configs DROP CONSTRAINT IF EXISTS configs_user_id_key;

-- Verificar se a tabela existe e recriar se necessário
DROP TABLE IF EXISTS configs CASCADE;

-- Recriar a tabela configs sem a constraint UNIQUE
CREATE TABLE configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pix_api_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Habilitar RLS
ALTER TABLE configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configs
CREATE POLICY "Users can view their own configs" ON configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configs" ON configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configs" ON configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configs" ON configs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configs_updated_at 
  BEFORE UPDATE ON configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_configs_user_id ON configs(user_id); 