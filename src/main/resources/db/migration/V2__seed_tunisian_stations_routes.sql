-- Seed Tunisian Louage Stations
INSERT INTO stations (id, name_fr, name_ar, governorate, address, phone, operating_hours, latitude, longitude) VALUES
(1, 'Gare Louage Bab Alioua (Tunis Sud)', 'محطة لواج باب عليوة (تونس الجنوبية)', 'Tunis', 'Place Bab Alioua, Avenue Moncef Bey, Tunis', '+216 71 391 220', '04:30 - 22:30 (7j/7)', 36.7865, 10.1812),
(2, 'Gare Louage Bab Saadoun (Tunis Nord)', 'محطة لواج باب سعدون (تونس الشمالية)', 'Tunis', 'Place Bab Saadoun, Boulevard 9 Avril, Tunis', '+216 71 560 310', '05:00 - 22:00 (7j/7)', 36.8089, 10.1584),
(3, 'Gare Louage Moncef Bey (Cap Bon)', 'محطة لواج منصف باي (الوطن القبلي)', 'Tunis', 'Rue d''Italie / Avenue Moncef Bey, Tunis', '+216 71 345 880', '05:30 - 21:30 (7j/7)', 36.7942, 10.1856),
(4, 'Gare Louage Sousse Sud (Bab Jdid)', 'محطة لواج سوسة الجنوبية (باب جديد)', 'Sousse', 'Avenue Léopold Senghor, Sousse', '+216 73 224 110', '05:00 - 22:00 (7j/7)', 35.8245, 10.6346),
(5, 'Gare Louage Sfax (El Ghorba / Sidi Mansour)', 'محطة لواج صفاقس (الغربة / سيدي منصور)', 'Sfax', 'Route de Gabès Km 1.5, Sfax', '+216 74 402 700', '04:30 - 23:00 (7j/7)', 34.7304, 10.7482),
(6, 'Gare Louage Bizerte (Bab Mateur)', 'محطة لواج بنزرت (باب ماطر)', 'Bizerte', 'Avenue Hassan Nouri, Bizerte', '+216 72 431 105', '05:00 - 21:30 (7j/7)', 37.2721, 9.8739),
(7, 'Gare Louage Kairouan (Cité El Jomhouria)', 'محطة لواج القيروان (حي الجمهورية)', 'Kairouan', 'Route de Sousse, Kairouan', '+216 77 230 450', '05:00 - 21:00 (7j/7)', 35.6781, 10.0963),
(8, 'Gare Louage Nabeul (Bir Challouf)', 'محطة لواج نابل (بئر شلوف)', 'Nabeul', 'Avenue Habib Bourguiba, Nabeul', '+216 72 285 300', '05:30 - 21:30 (7j/7)', 36.4561, 10.7376);

-- Seed Routes from Stations
INSERT INTO routes (id, station_id, destination_station_id, destination_name_fr, destination_name_ar, distance_km, estimated_duration_min, active) VALUES
(1, 1, 4, 'Sousse', 'سوسة', 142, 95, true),
(2, 1, 5, 'Sfax', 'صفاقس', 270, 180, true),
(3, 1, 7, 'Kairouan', 'القيروان', 155, 110, true),
(4, 1, NULL, 'Monastir', 'المنستير', 165, 115, true),
(5, 1, NULL, 'Mahdia', 'المهدية', 205, 150, true),
(6, 1, NULL, 'Gabès', 'قابس', 400, 260, true),
(7, 2, 6, 'Bizerte', 'بنزرت', 65, 55, true),
(8, 2, NULL, 'Béja', 'باجة', 105, 80, true),
(9, 2, NULL, 'Jendouba', 'جندوبة', 150, 120, true),
(10, 3, 8, 'Nabeul', 'نابل', 68, 60, true),
(11, 3, NULL, 'Hammamet', 'الحمامات', 62, 50, true),
(12, 3, NULL, 'Kélibia', 'قليبية', 105, 95, true);

-- Seed Official Fares (in millimes: 1 TND = 1000 millimes)
INSERT INTO route_fares (id, route_id, fare_millimes, valid_from) VALUES
(1, 1, 12200, CURRENT_TIMESTAMP), -- Tunis - Sousse: 12.200 TND
(2, 2, 22800, CURRENT_TIMESTAMP), -- Tunis - Sfax: 22.800 TND
(3, 3, 13500, CURRENT_TIMESTAMP), -- Tunis - Kairouan: 13.500 TND
(4, 4, 13800, CURRENT_TIMESTAMP), -- Tunis - Monastir: 13.800 TND
(5, 5, 17200, CURRENT_TIMESTAMP), -- Tunis - Mahdia: 17.200 TND
(6, 6, 28500, CURRENT_TIMESTAMP), -- Tunis - Gabès: 28.500 TND
(7, 7, 6800, CURRENT_TIMESTAMP),  -- Tunis - Bizerte: 6.800 TND
(8, 8, 8500, CURRENT_TIMESTAMP),  -- Tunis - Béja: 8.500 TND
(9, 9, 12000, CURRENT_TIMESTAMP), -- Tunis - Jendouba: 12.000 TND
(10, 10, 6200, CURRENT_TIMESTAMP), -- Tunis - Nabeul: 6.200 TND
(11, 11, 5500, CURRENT_TIMESTAMP), -- Tunis - Hammamet: 5.500 TND
(12, 12, 9400, CURRENT_TIMESTAMP); -- Tunis - Kélibia: 9.400 TND

-- Seed Vehicles (Standard 8-passenger Louage)
INSERT INTO vehicles (id, plate, driver_name, capacity) VALUES
(1, '215 تونس 8841', 'Ammi Hedi (عمّي الهادي)', 8),
(2, '189 تونس 4310', 'Chifour Salah (صالح القروي)', 8),
(3, '230 تونس 1904', 'Ammi Moncef (عمّي منصف)', 8),
(4, '194 تونس 7622', 'Chifour Kamel (كمال الصفاقسي)', 8),
(5, '208 تونس 5519', 'Si Ridha (سي رضا)', 8),
(6, '182 تونس 3998', 'Ammi Habib (عمّي الحبيب)', 8),
(7, '221 تونس 6120', 'Chifour Tarek (طارق المستيري)', 8),
(8, '176 تونس 9012', 'Ammi Faouzi (عمّي فوزي)', 8);

-- Seed Staff Users (Passwords: 'chifour2026')
INSERT INTO staff_users (id, username, password_hash, role, station_id, vehicle_id) VALUES
(1, 'admin', '$2a$10$7rX5QxY7nZ2F8d7sU6.a5O8qR6jP2xX3V8oM0.K0uO8Y9qR2eJ.2K', 'ADMIN', NULL, NULL),
(2, 'chifour_alioua', '$2a$10$7rX5QxY7nZ2F8d7sU6.a5O8qR6jP2xX3V8oM0.K0uO8Y9qR2eJ.2K', 'ATTENDANT', 1, NULL),
(3, 'driver_hedi', '$2a$10$7rX5QxY7nZ2F8d7sU6.a5O8qR6jP2xX3V8oM0.K0uO8Y9qR2eJ.2K', 'DRIVER', 1, 1);

-- Seed Active Queue Entries for Bab Alioua (Station 1)
-- Route 1 (Tunis -> Sousse):
INSERT INTO queue_entries (id, route_id, vehicle_id, status, sort_key, capacity, seats_taken, version, joined_at, boarding_started_at) VALUES
(1, 1, 1, 'BOARDING', 1700000000000000, 8, 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1, 2, 'QUEUED', 1700000000100000, 8, 0, 0, CURRENT_TIMESTAMP, NULL),
(3, 1, 3, 'QUEUED', 1700000000200000, 8, 0, 0, CURRENT_TIMESTAMP, NULL),

-- Route 2 (Tunis -> Sfax):
(4, 2, 4, 'BOARDING', 1700000000050000, 8, 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 2, 5, 'QUEUED', 1700000000150000, 8, 0, 0, CURRENT_TIMESTAMP, NULL),

-- Route 3 (Tunis -> Kairouan):
(6, 3, 6, 'BOARDING', 1700000000080000, 8, 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Route 4 (Tunis -> Monastir):
(7, 4, 7, 'BOARDING', 1700000000090000, 8, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Restart sequence generators past seeded IDs
ALTER TABLE stations ALTER COLUMN id RESTART WITH 100;
ALTER TABLE routes ALTER COLUMN id RESTART WITH 100;
ALTER TABLE route_fares ALTER COLUMN id RESTART WITH 100;
ALTER TABLE vehicles ALTER COLUMN id RESTART WITH 100;
ALTER TABLE staff_users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE queue_entries ALTER COLUMN id RESTART WITH 100;
