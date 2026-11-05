-- AeroGuard AI - Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id BIGSERIAL PRIMARY KEY,
    aircraft_id TEXT NOT NULL,
    engine_id TEXT NOT NULL,
    predicted_rul DOUBLE PRECISION NOT NULL,
    health_score INTEGER NOT NULL,
    risk_category TEXT NOT NULL,
    recommendation TEXT,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sensor Readings Table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    aircraft_id TEXT NOT NULL,
    engine_id TEXT NOT NULL,
    temperature DOUBLE PRECISION,
    vibration DOUBLE PRECISION,
    pressure DOUBLE PRECISION,
    predicted_rul DOUBLE PRECISION,
    health_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Maintenance Alerts Table
CREATE TABLE IF NOT EXISTS maintenance_alerts (
    id BIGSERIAL PRIMARY KEY,
    alert_id TEXT UNIQUE NOT NULL,
    aircraft_id TEXT NOT NULL,
    engine_id TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    predicted_rul INTEGER,
    risk_category TEXT,
    action_required TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) with public access policies for hackathon integration
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Allow public insert predictions" ON predictions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert sensor_readings" ON sensor_readings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read maintenance_alerts" ON maintenance_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert maintenance_alerts" ON maintenance_alerts FOR INSERT WITH CHECK (true);
