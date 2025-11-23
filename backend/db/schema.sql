-- Dinario Database Schema for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- EJECUTA ESTO PARA LIMPIAR TODO SI ES NECESARIO:
--DROP TABLE IF EXISTS audit_logs CASCADE;
--DROP TABLE IF EXISTS notifications CASCADE;
--DROP TABLE IF EXISTS subscriptions CASCADE;
--DROP TABLE IF EXISTS categories CASCADE;
--DROP TABLE IF EXISTS users CASCADE;

-- Tabla de Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  monthly_budget DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'es',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Suscripciones
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly')),
  start_date DATE NOT NULL,
  next_billing_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  payment_method VARCHAR(50),
  website_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Logs de Auditoría
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);


INSERT INTO categories (name, color, icon) VALUES
  ('Entretenimiento', '#E50914', '🎬'),
  ('Música', '#1DB954', '🎵'),
  ('Software', '#0078D4', '💻'),
  ('Juegos', '#5865F2', '🎮'),
  ('Impuestos', '#4285F4', '☁️'),
  ('Educacion', '#FFA500', '📚'),
  ('Productividad', '#7C3AED', '⚡'),
  ('Otros', '#6B7280', '📦')
ON CONFLICT DO NOTHING;

