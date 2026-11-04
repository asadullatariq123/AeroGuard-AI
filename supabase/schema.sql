-- AeroGuard AI Supabase schema.

create table if not exists public.aircraft (
    id uuid primary key default gen_random_uuid(),
    aircraft_name text not null,
    aircraft_model text not null,
    registration_number text not null unique,
    created_at timestamptz not null default now()
);

create table if not exists public.components (
    id uuid primary key default gen_random_uuid(),
    aircraft_id uuid not null references public.aircraft(id) on delete cascade,
    component_name text not null,
    component_type text not null,
    status text not null default 'operational'
        check (status in ('operational', 'monitoring', 'maintenance_required', 'offline')),
    created_at timestamptz not null default now(),
    unique (aircraft_id, component_name)
);

create table if not exists public.sensor_readings (
    id uuid primary key default gen_random_uuid(),
    component_id uuid not null references public.components(id) on delete cascade,
    temperature numeric(9, 3) not null,
    vibration numeric(10, 4) not null check (vibration >= 0),
    pressure numeric(10, 3) not null check (pressure >= 0),
    recorded_at timestamptz not null default now(),
    data_source text not null default 'NASA_CMAPSS'
);

create table if not exists public.predictions (
    id uuid primary key default gen_random_uuid(),
    component_id uuid not null references public.components(id) on delete cascade,
    risk_score numeric(5, 4) not null check (risk_score between 0 and 1),
    risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
    predicted_rul_cycles integer not null check (predicted_rul_cycles >= 0),
    top_contributors jsonb not null default '[]'::jsonb,
    recommendation text not null,
    created_at timestamptz not null default now(),
    data_source text not null default 'MODEL_OUTPUT'
);

create table if not exists public.maintenance_alerts (
    id uuid primary key default gen_random_uuid(),
    component_id uuid not null references public.components(id) on delete cascade,
    alert_type text not null,
    description text not null,
    priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
    status text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
    created_at timestamptz not null default now(),
    data_source text not null default 'MODEL_OUTPUT'
);

create index if not exists idx_sensor_readings_component_recorded
    on public.sensor_readings (component_id, recorded_at desc);
create index if not exists idx_predictions_component_created
    on public.predictions (component_id, created_at desc);
create index if not exists idx_alerts_component_created
    on public.maintenance_alerts (component_id, created_at desc);

alter table public.aircraft enable row level security;
alter table public.components enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.predictions enable row level security;
alter table public.maintenance_alerts enable row level security;
