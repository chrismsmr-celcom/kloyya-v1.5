-- supabase/migrations/0002_operations_layer.sql
-- Locations, resources, work items and their relationships.
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- after your existing organizations / issues / actions schema.

create extension if not exists "pgcrypto";

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type text not null check (type in ('depot', 'warehouse', 'customer_location', 'office')),
  city text not null default '',
  country text not null default '',
  health integer not null default 100 check (health between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists locations_org_idx on locations (organization_id);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  name text not null,
  type text not null check (type in ('vehicle', 'driver', 'machine', 'inventory', 'warehouse')),
  status text not null default 'idle' check (status in ('active', 'idle', 'maintenance', 'offline')),
  health integer not null default 100 check (health between 0 and 100),
  metrics jsonb not null default '[]'::jsonb,
  recent_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_org_idx on resources (organization_id);
create index if not exists resources_location_idx on resources (location_id);

create table if not exists work_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  title text not null,
  type text not null check (type in ('delivery', 'work_order', 'inspection', 'incident')),
  status text not null default 'open' check (status in ('open', 'assigned', 'in_progress', 'blocked', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee text not null default 'Unassigned',
  eta_minutes integer,
  delay_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists work_items_org_idx on work_items (organization_id);
create index if not exists work_items_location_idx on work_items (location_id);
create index if not exists work_items_status_idx on work_items (status);

create table if not exists work_item_resources (
  work_item_id uuid not null references work_items(id) on delete cascade,
  resource_id uuid not null references resources(id) on delete cascade,
  primary key (work_item_id, resource_id)
);

-- Link issues to a location/resource/work item (app/api/dashboard/route.ts
-- already selects `*` on issues, so these columns come through for free).
alter table issues add column if not exists location_id uuid references locations(id) on delete set null;
alter table issues add column if not exists resource_id uuid references resources(id) on delete set null;
alter table issues add column if not exists work_item_id uuid references work_items(id) on delete set null;

-- Row Level Security: members can read rows that belong to
-- organizations they're a member of. Writes happen through
-- app/api/* using the service role key, which bypasses RLS,
-- so no insert/update/delete policies are needed here.
alter table locations enable row level security;
alter table resources enable row level security;
alter table work_items enable row level security;
alter table work_item_resources enable row level security;

create policy "Members can read their org locations"
  on locations for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "Members can read their org resources"
  on resources for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "Members can read their org work items"
  on work_items for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

create policy "Members can read work item resource links"
  on work_item_resources for select
  using (
    work_item_id in (
      select id from work_items
      where organization_id in (
        select organization_id from organization_members where user_id = auth.uid()
      )
    )
  );
