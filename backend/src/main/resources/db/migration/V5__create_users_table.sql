INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@example.com',
    '$2b$10$iD9om.uf80ThacbueVRCru40GdG1flGA8wyonTVNRFry6dlCxOesK',
    'ADMIN'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

