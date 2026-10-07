-- ==============================================================================
-- Nashik Monitor - Neon PostgreSQL Unified Roles & Complaints Schema
-- Architecture: CPGRAMS / Aaple Sarkar Multi-Tier Departmental Redressal
-- ==============================================================================

-- 1. Create a specialized ENUM type for secure access control assignment
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'SUB_ADMIN', 'SUPER_ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Master unified authentication table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'CITIZEN',
    assigned_sector VARCHAR(50) DEFAULT NULL, -- Populated strictly for SUB_ADMINs (e.g., 'PUBLIC_WORKS_ROADS')
    ward VARCHAR(100),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Core complaints table architecture with sector routing
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    citizen_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    sector VARCHAR(50) NOT NULL, -- PUBLIC_WORKS_ROADS, DRAINAGE_SEWAGE, ELECTRICAL, SOLID_WASTE, WATER_SUPPLY
    status VARCHAR(30) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_sector ON complaints(sector);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
