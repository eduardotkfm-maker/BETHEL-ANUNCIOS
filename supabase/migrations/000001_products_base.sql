-- Migration file: 000001_products_base.sql

-- Table: products
-- Used to store products/services of the agency's clients to be used as context for the AI script generator.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price VARCHAR(100),
    deliverables TEXT, -- O que o produto/serviço entrega
    pain_solved TEXT,  -- Que dor resolve
    niche VARCHAR(100),
    product_type VARCHAR(100), -- e.g., 'Infoproduto', 'Serviço Físico', 'Mentoria', etc.
    agency_id UUID, -- For future multi-tenant logic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some index for fast lookup
CREATE INDEX IF NOT EXISTS idx_products_niche ON public.products(niche);
