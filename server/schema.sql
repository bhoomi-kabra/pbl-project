-- ============================================================
-- NASHIK ROADS & CIVIC MONITOR - POSTGRESQL DATABASE SCHEMA
-- Compatible with PostgreSQL 13+ and Supabase / PostGIS
-- ============================================================

-- Enable PostGIS for spatial GIS queries if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. WARDS TABLE
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(100) NOT NULL UNIQUE,
    name_mr VARCHAR(100) NOT NULL,
    ward_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONTRACTORS TABLE
CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_name VARCHAR(150) NOT NULL UNIQUE,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    performance_score DECIMAL(3,2) DEFAULT 4.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROAD PROJECTS TABLE
CREATE TABLE IF NOT EXISTS road_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_name VARCHAR(255) NOT NULL,
    road_name_mr VARCHAR(255) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    lifecycle_state VARCHAR(50) NOT NULL CHECK (lifecycle_state IN ('TRENCHING', 'CONCRETING', 'CURING', 'COMPLETED')),
    contractor VARCHAR(150) NOT NULL,
    budget_inr VARCHAR(100) NOT NULL,
    dlp_period VARCHAR(100) NOT NULL,
    start_date DATE,
    expected_completion DATE,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    polyline_coords JSONB, -- Stores array of lat/lng pairs [[20.0, 73.7], ...]
    progress_photo TEXT,
    description TEXT,
    description_mr TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CIVIC COMPLAINTS / TICKETS TABLE
CREATE TABLE IF NOT EXISTS civic_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    title_mr VARCHAR(255) NOT NULL,
    hazard_type VARCHAR(100) NOT NULL CHECK (hazard_type IN ('ELECTRICAL_HAZARD', 'POTHOLE', 'UNAUTHORIZED_EXCAVATION', 'WATER_LEAKAGE', 'STREETLIGHT_DEFECT', 'DRAINAGE_OVERFLOW')),
    ward VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'VERIFICATION_PENDING' CHECK (status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'EVIDENCE_UPLOADED', 'VERIFICATION_PENDING', 'CLOSED_VERIFIED', 'REOPENED_ESCALATED')),
    submitted_date VARCHAR(50) NOT NULL,
    assigned_engineer VARCHAR(150),
    contractor_agency VARCHAR(150),
    dlp_expiry_date VARCHAR(100),
    before_photo TEXT,
    after_photo TEXT,
    ai_confidence INT DEFAULT 95,
    citizen_votes_confirmed INT DEFAULT 0,
    citizen_votes_reopened INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED INITIAL NASHIK DATA INTO POSTGRESQL
-- ============================================================

INSERT INTO wards (name_en, name_mr, ward_number) VALUES
('Panchavati', 'पंचवटी', 1),
('Nashik East', 'नाशिक पूर्व', 2),
('Nashik West', 'नाशिक पश्चिम', 3),
('Cidco', 'सिडको', 4),
('Satpur', 'सातपूर', 5),
('Nashik Road', 'नाशिक रोड', 6)
ON CONFLICT (name_en) DO NOTHING;

INSERT INTO road_projects (road_name, road_name_mr, ward, lifecycle_state, contractor, budget_inr, dlp_period, lat, lng, progress_photo, description, description_mr) VALUES
('College Road (Thatte Nagar to Krishi Nagar)', 'कॉलेज रोड (ठत्ते नगर ते कृषी नगर)', 'Nashik West', 'TRENCHING', 'L&T Smart City Infrastructure Ltd.', '₹ 4,85,00,000', '36 Months (Expires Nov 2027)', 20.0035, 73.7668, 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=600&auto=format&fit=crop&q=80', 'Underground optical fiber ducting excavation.', 'भूमिगत ऑप्टिकल फायबर उत्खनन.'),
('Gangapur Road (Jehan Circle to Serene Meadows)', 'गंगापूर रोड (जहाँ सर्कल ते सिरीन मेडोज)', 'Panchavati', 'CONCRETING', 'KCC Buildcon Engineering', '₹ 8,20,00,000', '60 Months (Expires Jan 2030)', 20.0150, 73.7620, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80', 'White topping and high-density M40 concreting.', 'व्हाईट टॉपिंग आणि M40 काँक्रीटीकरण.'),
('Panchavati Karanja & Ramkund Connecting Arterial', 'पंचवटी कारंजा व रामकुंड जोडणारा मार्ग', 'Panchavati', 'CURING', 'Nashik Heritage Roads Infrastructure', '₹ 2,40,00,000', '24 Months (Expires Mar 2028)', 20.0080, 73.7925, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80', 'Water curing & heavy vehicle restriction phase.', 'काँक्रीट वॉटर क्युअरींग टप्पा.'),
('Nashik-Pune Highway (Dwarka Flyover to Bitco Chowk)', 'नाशिक-पुणे महामार्ग (द्वारका उड्डाणपूल ते बिटको चौक)', 'Nashik Road', 'COMPLETED', 'Gayatri Projects & NMC Infra', '₹ 14,50,00,000', '48 Months (Active till May 2029)', 19.9650, 73.8180, 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80', '6-lane asphalt resurfacing complete.', '६-पदरी मस्टिक डांबर नूतनीकरण पूर्ण.');

INSERT INTO civic_tickets (ticket_number, title, title_mr, hazard_type, ward, location, lat, lng, status, submitted_date, assigned_engineer, contractor_agency, dlp_expiry_date, before_photo, after_photo, ai_confidence, citizen_votes_confirmed, citizen_votes_reopened) VALUES
('NMC-2026-8841', 'Exposed High-Voltage Cable & Open Trench', 'उघडी उच्च दाबाची केबल आणि खड्डा', 'ELECTRICAL_HAZARD', 'Panchavati', 'Near K.K. Wagh Engineering College Main Gate', 20.0180, 73.8180, 'VERIFICATION_PENDING', '06 Aug 2026', 'Er. Rajesh Deshmukh', 'M/s Vidyut Urban Infra', '15 Nov 2027', 'https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80', 98, 14, 2),
('NMC-2026-7732', 'Deep Cave-in Pothole on Curve', 'वळणावर मोठा धोकादायक खड्डा', 'POTHOLE', 'Nashik West', 'College Road, Opp Bhonsala Gate 2', 20.0050, 73.7620, 'VERIFICATION_PENDING', '04 Aug 2026', 'Er. Sunita Patil', 'L&T Infrastructure', '20 Oct 2027', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop&q=80', 95, 28, 1)
ON CONFLICT (ticket_number) DO NOTHING;
