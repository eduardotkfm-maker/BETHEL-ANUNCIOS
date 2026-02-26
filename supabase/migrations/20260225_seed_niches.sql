-- Seed Niches for Gold Library
INSERT INTO public.niches (name)
VALUES 
    ('Saúde/Estética'),
    ('Salão de Beleza'),
    ('Roupas e Calçados'),
    ('Psicologia'),
    ('Posicionamento'),
    ('PetShop'),
    ('Óticas'),
    ('Odontologia'),
    ('Mecânica/Estética Automotiva'),
    ('Material de Apoio'),
    ('Marmoraria'),
    ('Joias/ Semi-joias'),
    ('Infoproduto'),
    ('IA'),
    ('Estúdio de Tatuagem'),
    ('Educação'),
    ('E-commerce'),
    ('Direito'),
    ('Design de Interiores'),
    ('Contratação'),
    ('Barbearia'),
    ('Arquitetura')
ON CONFLICT (name) DO NOTHING;
