-- Migration file: 000000_init_bethel.sql

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: gold_library
-- Used by the Agency to store top-performing creatives as references.
CREATE TABLE IF NOT EXISTS public.gold_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(1024),
    format VARCHAR(50) DEFAULT 'Reels', -- Reels, Stories, Feed
    niche VARCHAR(100) NOT NULL,
    agency_id UUID, -- For future multi-tenant agency logic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: creative_production_tasks
-- Used to manage the workflow/kanban of creatives requested by the AI or Client.
CREATE TABLE IF NOT EXISTS public.creative_production_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    script TEXT,
    -- Status values: 'idea', 'script_approved', 'recording', 'editing', 'ready'
    status VARCHAR(50) DEFAULT 'idea' NOT NULL,
    video_url VARCHAR(1024),
    client_id UUID, -- References the client/user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some index for fast lookup
CREATE INDEX IF NOT EXISTS idx_gold_library_niche ON public.gold_library(niche);
CREATE INDEX IF NOT EXISTS idx_cpt_status_client ON public.creative_production_tasks(status, client_id);
