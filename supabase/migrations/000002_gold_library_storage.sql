-- Agrega coluna de thumbnail para a galeria
ALTER TABLE public.gold_library ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(1024);

-- Cria o Bucket no Supabase Storage para hospedar os vídeos MP4
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gold_library_videos', 'gold_library_videos', true) 
ON CONFLICT (id) DO NOTHING;

-- Políticas de Acesso Público para Leitura e Escrita (Ambiente Playground)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gold_library_videos');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gold_library_videos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'gold_library_videos');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'gold_library_videos');
