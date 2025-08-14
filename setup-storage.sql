-- Configurar bucket de storage para mídia
-- Execute este script no SQL Editor do Supabase

-- Criar bucket para mídia
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de arquivos autenticados
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated'
);

-- Política para permitir visualização pública
CREATE POLICY "Visualização pública de mídia" ON storage.objects
FOR SELECT USING (
  bucket_id = 'media'
);

-- Política para permitir atualização de arquivos próprios
CREATE POLICY "Usuários podem atualizar seus próprios arquivos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir exclusão de arquivos próprios
CREATE POLICY "Usuários podem deletar seus próprios arquivos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Função para limpar arquivos órfãos (opcional)
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'media' 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND name NOT IN (
    SELECT DISTINCT media_url 
    FROM funnels 
    WHERE media_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql; 