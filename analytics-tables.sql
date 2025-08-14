-- Script para criar tabelas de analytics no Supabase
-- Execute este script no SQL Editor do Supabase após o schema principal

-- Tabela de transações PIX
CREATE TABLE IF NOT EXISTS pix_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0 AND amount <= 150),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'expired')) DEFAULT 'pending',
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE NOT NULL,
  button_id TEXT NOT NULL, -- ID do botão inline
  telegram_user_id BIGINT NOT NULL,
  pix_id TEXT, -- ID do PIX na API externa
  qr_code TEXT, -- Base64 do QR Code
  copy_paste_key TEXT, -- Chave copia e cola
  button_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Tabela de interações com bots
CREATE TABLE IF NOT EXISTS bot_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('start', 'button_click', 'pix_generation', 'pix_view', 'pix_confirm')),
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE NOT NULL,
  button_id TEXT, -- ID do botão (se aplicável)
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL, -- ID da sessão para agrupar interações
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pix_transactions
CREATE POLICY "Users can view their own pix transactions" ON pix_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pix transactions" ON pix_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pix transactions" ON pix_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pix transactions" ON pix_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para bot_interactions
CREATE POLICY "Users can view their own bot interactions" ON bot_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot interactions" ON bot_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot interactions" ON bot_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot interactions" ON bot_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON pix_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_created_at ON pix_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_bot_id ON pix_transactions(bot_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_funnel_id ON pix_transactions(funnel_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_telegram_user_id ON pix_transactions(telegram_user_id);

CREATE INDEX IF NOT EXISTS idx_bot_interactions_user_id ON bot_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_bot_id ON bot_interactions(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_type ON bot_interactions(type);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_timestamp ON bot_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_session_id ON bot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_bot_interactions_telegram_user_id ON bot_interactions(telegram_user_id);

-- Função para expirar transações PIX automaticamente
CREATE OR REPLACE FUNCTION expire_old_pix_transactions()
RETURNS void AS $$
BEGIN
  UPDATE pix_transactions 
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar completed_at quando status for 'completed'
CREATE OR REPLACE FUNCTION update_pix_transaction_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.failed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pix_transaction_timestamps_trigger
  BEFORE UPDATE ON pix_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_pix_transaction_timestamps();

-- View para analytics agregados por dia
CREATE OR REPLACE VIEW daily_analytics AS
SELECT 
  user_id,
  DATE(created_at) as date,
  COUNT(*) as total_transactions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_transactions,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_transactions,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions,
  SUM(amount) as total_amount,
  SUM(amount) FILTER (WHERE status = 'completed') as completed_amount,
  SUM(amount) FILTER (WHERE status = 'pending') as pending_amount,
  COUNT(DISTINCT telegram_user_id) as unique_users,
  COUNT(DISTINCT bot_id) as active_bots,
  COUNT(DISTINCT funnel_id) as active_funnels
FROM pix_transactions
GROUP BY user_id, DATE(created_at);

-- View para top performers
CREATE OR REPLACE VIEW funnel_performance AS
SELECT 
  f.user_id,
  f.id as funnel_id,
  f.name as funnel_name,
  COUNT(pt.id) as total_transactions,
  COUNT(pt.id) FILTER (WHERE pt.status = 'completed') as completed_transactions,
  SUM(pt.amount) FILTER (WHERE pt.status = 'completed') as total_revenue,
  AVG(pt.amount) FILTER (WHERE pt.status = 'completed') as avg_transaction_value,
  COUNT(DISTINCT pt.telegram_user_id) as unique_users,
  COUNT(bi.id) FILTER (WHERE bi.type = 'button_click') as total_clicks,
  CASE 
    WHEN COUNT(bi.id) FILTER (WHERE bi.type = 'button_click') > 0 
    THEN (COUNT(pt.id) FILTER (WHERE pt.status = 'completed') * 100.0) / COUNT(bi.id) FILTER (WHERE bi.type = 'button_click')
    ELSE 0
  END as conversion_rate
FROM funnels f
LEFT JOIN pix_transactions pt ON f.id = pt.funnel_id
LEFT JOIN bot_interactions bi ON f.id = bi.funnel_id
GROUP BY f.user_id, f.id, f.name;

-- Função para limpar dados antigos (manter apenas últimos 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
  -- Limpar interações antigas (manter 90 dias)
  DELETE FROM bot_interactions 
  WHERE timestamp < NOW() - INTERVAL '90 days';
  
  -- Limpar transações antigas concluídas/falhadas (manter 90 dias)
  DELETE FROM pix_transactions 
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('completed', 'failed', 'expired');
    
  -- Log da limpeza
  INSERT INTO bot_interactions (
    bot_id, telegram_user_id, type, funnel_id, 
    metadata, session_id, user_id
  )
  SELECT 
    (SELECT id FROM bots LIMIT 1),
    0,
    'system',
    (SELECT id FROM funnels LIMIT 1),
    '{"action": "cleanup_executed"}'::jsonb,
    'system',
    auth.uid()
  WHERE EXISTS (SELECT 1 FROM bots) AND EXISTS (SELECT 1 FROM funnels);
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE pix_transactions IS 'Tabela para rastrear transações PIX geradas pelos bots';
COMMENT ON TABLE bot_interactions IS 'Tabela para rastrear todas as interações dos usuários com os bots';
COMMENT ON VIEW daily_analytics IS 'View agregada para analytics diários';
COMMENT ON VIEW funnel_performance IS 'View para performance de funis com métricas de conversão';