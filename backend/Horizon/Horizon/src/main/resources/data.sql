INSERT INTO tb_user(email, password, username) VALUES('conta@gmail.com', '123455', 'Pedro Silva');
INSERT INTO tb_user(email, password, username) VALUES('a@b', '123', 'Pedro de Souza');

-- ---------------------------------------------------------------------------------------------
-- DEMO DATA for presentations. Remove before using real producers' data.
-- Fields are real coordinates in Sorriso (MT); satellite data is fetched live from Earth Engine.
-- Points are [lat, lng].
-- ---------------------------------------------------------------------------------------------

-- User 1 (conta@gmail.com): Sítio Santa Helena
INSERT INTO tb_field(id, owner_id, name, farm, municipality, crop, planted_at, boundary, entrance_lat, entrance_lng)
VALUES ('talhao-3', 1, 'Talhão 3', 'Sítio Santa Helena', 'Sorriso, MT', 'Soja', DATE '2026-09-25',
        '[[-12.4735,-55.9335],[-12.4735,-55.92798],[-12.469249,-55.92798],[-12.468797,-55.928348],[-12.468797,-55.9335]]',
        -12.470787, -55.92798);
INSERT INTO tb_field(id, owner_id, name, farm, municipality, crop, planted_at, boundary, entrance_lat, entrance_lng)
VALUES ('talhao-1', 1, 'Talhão 1', 'Sítio Santa Helena', 'Sorriso, MT', 'Soja', DATE '2026-09-20',
        '[[-12.472777,-55.941044],[-12.472777,-55.934604],[-12.468707,-55.934604],[-12.468707,-55.941044]]',
        -12.472777, -55.934604);
-- Scripted stress zone in Talhão 1 so the leaf-photo flow can be shown even when the real
-- satellite passes show no drop. Its NDVI/NDMI series is still computed live by Earth Engine.
INSERT INTO tb_stress_zone(id, field_id, polygon, area_ha, detected_at, compared_with, vigor_drop_pct, field_drop_pct,
                           ndmi_before, ndmi_after, scout_lat, scout_lng, status)
VALUES ('talhao-1-z1', 'talhao-1',
        '[[-12.4712,-55.9392],[-12.4712,-55.9379],[-12.4700,-55.9379],[-12.4700,-55.9392]]',
        1.9, DATE '2026-11-18', DATE '2026-11-08', -18.4, -2.1, 0.31, 0.22, -12.4706, -55.9386, 'AWAITING_PHOTO');
INSERT INTO tb_field(id, owner_id, name, farm, municipality, crop, planted_at, boundary, entrance_lat, entrance_lng)
VALUES ('talhao-5', 1, 'Talhão 5', 'Sítio Santa Helena', 'Sorriso, MT', 'Milho', DATE '2026-10-01',
        '[[-12.480011,-55.933132],[-12.480011,-55.928348],[-12.476574,-55.92798],[-12.476394,-55.933132]]',
        -12.476394, -55.93074);

-- User 2 (a@b): neighbors who receive the community alerts
INSERT INTO tb_field(id, owner_id, name, farm, municipality, crop, planted_at, boundary, entrance_lat, entrance_lng)
VALUES ('lote-2', 2, 'Lote 2', 'Sítio Boa Esperança', 'Sorriso, MT', 'Soja', DATE '2026-09-28',
        '[[-12.42779,-55.872739],[-12.42779,-55.86676],[-12.423268,-55.86676],[-12.423268,-55.872739]]',
        -12.42779, -55.872739);
INSERT INTO tb_field(id, owner_id, name, farm, municipality, crop, planted_at, boundary, entrance_lat, entrance_lng)
VALUES ('lote-14', 2, 'Lote 14', 'Gleba Mercedes', 'Sorriso, MT', 'Soja', DATE '2026-09-22',
        '[[-12.520036,-55.93898],[-12.520036,-55.933919],[-12.516238,-55.933919],[-12.516238,-55.93898]]',
        -12.520036, -55.93898);

-- Extension technicians by municipality
INSERT INTO tb_technician(name, organization, phone, municipality)
VALUES ('Carla Menezes', 'Assistência técnica · Cooperativa Vale Verde', '(66) 3000-0142', 'Sorriso, MT');

-- Regional outbreaks reported before the app (demo). Dates stay recent relative to today.
INSERT INTO tb_outbreak(id, disease, status, lat, lng, reported_at, locality, alerted_producers, visit_scheduled)
VALUES ('demo-o1', 'Ferrugem asiática', 'confirmed', -12.418746, -55.877339, DATEADD('DAY', -4, CURRENT_DATE), 'Gleba Rio Lira', 9, FALSE);
INSERT INTO tb_outbreak(id, disease, status, lat, lng, reported_at, locality, alerted_producers, visit_scheduled)
VALUES ('demo-o2', 'Ferrugem asiática', 'confirmed', -12.476626, -55.824898, DATEADD('DAY', -6, CURRENT_DATE), 'Linha Boa Esperança', 12, FALSE);
INSERT INTO tb_outbreak(id, disease, status, lat, lng, reported_at, locality, alerted_producers, visit_scheduled)
VALUES ('demo-o3', 'Ferrugem asiática', 'confirmed', -12.350014, -55.960141, DATEADD('DAY', -9, CURRENT_DATE), 'Comunidade Primavera', 16, FALSE);
INSERT INTO tb_outbreak(id, disease, status, lat, lng, reported_at, locality, producer, field_name, municipality, area_ha, vigor_drop_pct, alerted_producers, visit_scheduled)
VALUES ('demo-s1', 'Ferrugem asiática', 'suspected', -12.526367, -55.93806, DATEADD('DAY', -1, CURRENT_DATE), 'Gleba Mercedes', 'Gleba Mercedes, lote 9', 'Soja', 'Sorriso, MT', 18.0, -11.0, 0, FALSE);
INSERT INTO tb_outbreak(id, disease, status, lat, lng, reported_at, locality, producer, field_name, municipality, area_ha, vigor_drop_pct, alerted_producers, visit_scheduled)
VALUES ('demo-s2', 'Mancha-alvo', 'suspected', -12.452208, -56.082503, DATEADD('DAY', -2, CURRENT_DATE), 'Linha 5', 'Sítio Linha 5', 'Soja', 'Sorriso, MT', 9.5, -8.0, 0, FALSE);
