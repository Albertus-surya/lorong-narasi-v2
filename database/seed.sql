USE defaultdb;

-- Super Admin default (password: admin123)
INSERT INTO admins (username, password, fullname, role) VALUES
('superadmin', '$2b$10$rQZ8K5Y5Y5Y5Y5Y5Y5Y5Yuplaceholder', 'Super Administrator', 'superadmin');

-- Categories
INSERT INTO categories (name, slug) VALUES
('Dongeng', 'dongeng'),
('Legenda', 'legenda'),
('Cerita Rakyat', 'cerita-rakyat'),
('Fabel', 'fabel'),
('Mitos', 'mitos');
