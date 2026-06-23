-- Store resolved city on place snapshots to avoid reverse geocoding on every favorites read.

alter table places add column if not exists city text;

create index if not exists places_city_idx on places (city) where city is not null;
