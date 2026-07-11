-- 1. USUARIOS POR DEFECTO
-- Eliminar usuarios existentes para evitar conflictos
DELETE FROM users WHERE email IN ('admin@dinerio.com', 'usuario@ejemplo.com', 'maria.garcia@ejemplo.com');
-- Usuario administrador
-- Contraseña: Admin2025*
INSERT INTO users (id, email, password, first_name, last_name, role, monthly_budget, currency)
VALUES (
  'a1b2c3d4-1234-5678-9000-000000000001'::UUID,
  'admin@dinerio.com',
  '$2a$10$IARX42kkp.OsWCeXJFwAEOi/PHCmeVtyLNlJwy2JxW7UjOjVX.2Le',
  'Admin',
  'Sistema',
  'admin',
  1500.00,
  'USD'
);
-- usuario@ejemplo.com
-- Contraseña: Vane123.
INSERT INTO users (id, email, password, first_name, last_name, role, monthly_budget, currency)
VALUES (
  'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
  'usuario@ejemplo.com',
  '$2a$10$XaoSYdaBDkfQf9wDlWRg7.AaH6zv/1MRnB8W0DsR.g9L57NOjLKkG',
  'Juan',
  'Pérez',
  'user',
  800.00,
  'USD'
);
-- maria.garcia@ejemplo.com
-- Contraseña: Password123
INSERT INTO users (id, email, password, first_name, last_name, role, monthly_budget, currency)
VALUES (
  'c3d4e5f6-3456-7890-9000-000000000003'::UUID,
  'maria.garcia@ejemplo.com',
  '$2a$10$XaoSYdaBDkfQf9wDlWRg7.AaH6zv/1MRnB8W0DsR.g9L57NOjLKkG',
  'María',
  'García',
  'user',
  600.00,
  'USD'
);
-- 2. SUSCRIPCIONES DE EJEMPLO PARA USUARIO
-- Eliminar suscripciones existentes del usuario demo
DELETE FROM subscriptions WHERE user_id = 'b2c3d4e5-2345-6789-9000-000000000002'::UUID;
INSERT INTO subscriptions (
  user_id,
  category_id,
  name,
  description,
  amount,
  currency,
  billing_cycle,
  start_date,
  next_billing_date,
  status,
  payment_method,
  website_url
)
SELECT
  'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
  (SELECT id FROM categories WHERE name = 'Entretenimiento' LIMIT 1),
  'Netflix Premium',
  'Suscripción familiar 4 pantallas, Ultra HD',
  15.99,
  'USD',
  'monthly',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '5 days',
  'active',
  'Visa **** 1234',
  'https://netflix.com'
UNION ALL
SELECT
  'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
  (SELECT id FROM categories WHERE name = 'Entretenimiento' LIMIT 1),
  'Disney+ Annual',
  'Suscripción anual con todos los contenidos',
  79.99,
  'USD',
  'yearly',
  CURRENT_DATE - INTERVAL '2 months',
  CURRENT_DATE + INTERVAL '15 days',
  'active',
  'Mastercard **** 5678',
  'https://disneyplus.com'
UNION ALL
SELECT
  'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
  (SELECT id FROM categories WHERE name = 'Música' LIMIT 1),
  'Spotify Family',
  'Plan familiar para 6 personas',
  16.99,
  'USD',
  'monthly',
  CURRENT_DATE - INTERVAL '8 months',
  CURRENT_DATE + INTERVAL  '8 days',
  'active',
  'PayPal',
  'https://spotify.com';

INSERT INTO categories (name, color, icon) VALUES
  ('Streaming', '#E50914', '🎬'),
  ('Software', '#0078D4', '💻'),
  ('Juegos', '#5865F2', '🎮'),
  ('Educación', '#F59E0B', '📚')
ON CONFLICT (name) DO NOTHING;

-- 3. DEUDAS DE EJEMPLO (pagos vencidos / no cubiertos)
DELETE FROM debts WHERE user_id = 'b2c3d4e5-2345-6789-9000-000000000002'::UUID;

INSERT INTO debts (user_id, category_id, name, amount, currency, due_date, status)
VALUES
  (
    'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
    (SELECT id FROM categories WHERE name = 'Entretenimiento' LIMIT 1),
    'HBO Max', 4990.00, 'ARS', CURRENT_DATE - INTERVAL '12 days', 'pending'
  ),
  (
    'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
    (SELECT id FROM categories WHERE name = 'Entretenimiento' LIMIT 1),
    'Netflix', 3990.00, 'ARS', CURRENT_DATE - INTERVAL '5 days', 'pending'
  ),
  (
    'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
    (SELECT id FROM categories WHERE name = 'Software' LIMIT 1),
    'Microsoft 365', 3510.00, 'ARS', CURRENT_DATE + INTERVAL '1 day', 'pending'
  ),
  (
    'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
    (SELECT id FROM categories WHERE name = 'Música' LIMIT 1),
    'Spotify', 2100.00, 'ARS', CURRENT_DATE - INTERVAL '20 days', 'paid'
  ),
  (
    'b2c3d4e5-2345-6789-9000-000000000002'::UUID,
    (SELECT id FROM categories WHERE name = 'Otros' LIMIT 1),
    'Gym Urbano', 7200.00, 'ARS', CURRENT_DATE - INTERVAL '18 days', 'paid'
  );

UPDATE debts SET paid_at = due_date + INTERVAL '3 days' WHERE name = 'Spotify' AND status = 'paid';
UPDATE debts SET paid_at = due_date + INTERVAL '1 day' WHERE name = 'Gym Urbano' AND status = 'paid';
