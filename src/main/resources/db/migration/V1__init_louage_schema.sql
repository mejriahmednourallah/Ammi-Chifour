-- Louage Live Schema Initialization

CREATE TABLE stations (
    id bigserial PRIMARY KEY,
    name_fr text NOT NULL,
    name_ar text,
    governorate text,
    address text,
    phone text,
    operating_hours text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL
);

CREATE TABLE routes (
    id bigserial PRIMARY KEY,
    station_id bigint NOT NULL REFERENCES stations(id),
    destination_station_id bigint REFERENCES stations(id),
    destination_name_fr text NOT NULL,
    destination_name_ar text NOT NULL,
    distance_km integer NOT NULL DEFAULT 100,
    estimated_duration_min integer NOT NULL DEFAULT 60,
    active boolean NOT NULL DEFAULT true
);

CREATE TABLE route_fares (
    id bigserial PRIMARY KEY,
    route_id bigint NOT NULL REFERENCES routes(id),
    fare_millimes integer NOT NULL,
    valid_from timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id bigserial PRIMARY KEY,
    plate text NOT NULL UNIQUE,
    driver_name text,
    capacity smallint NOT NULL DEFAULT 8
);

CREATE TABLE staff_users (
    id bigserial PRIMARY KEY,
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL CHECK (role IN ('ADMIN', 'ATTENDANT', 'DRIVER')),
    station_id bigint REFERENCES stations(id),
    vehicle_id bigint REFERENCES vehicles(id)
);

CREATE TABLE queue_entries (
    id bigserial PRIMARY KEY,
    route_id bigint NOT NULL REFERENCES routes(id),
    vehicle_id bigint NOT NULL REFERENCES vehicles(id),
    status text NOT NULL CHECK (status IN ('QUEUED', 'BOARDING', 'FULL', 'DEPARTED', 'CANCELLED')),
    sort_key bigint NOT NULL,
    capacity smallint NOT NULL DEFAULT 8,
    seats_taken smallint NOT NULL DEFAULT 0 CHECK (seats_taken BETWEEN 0 AND capacity),
    version integer NOT NULL DEFAULT 0,
    joined_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    boarding_started_at timestamp with time zone,
    full_at timestamp with time zone,
    departed_at timestamp with time zone
);

CREATE TABLE seat_events (
    event_id uuid PRIMARY KEY,
    queue_entry_id bigint NOT NULL REFERENCES queue_entries(id),
    delta smallint NOT NULL,
    client_ts timestamp with time zone NOT NULL,
    server_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id bigint
);

CREATE INDEX idx_queue_route_status ON queue_entries(route_id, status);
CREATE INDEX idx_queue_vehicle_status ON queue_entries(vehicle_id, status);
CREATE INDEX idx_seat_events_queue ON seat_events(queue_entry_id);
