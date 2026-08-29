-- =========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS DOMIFINAN PARA SUPABASE / POSTGRES
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  avatar_url TEXT,
  birth_date TEXT,
  phone TEXT,
  primary_currency TEXT DEFAULT 'DOP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE MÉTODOS DE PAGO / CUENTAS
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  bank_name TEXT,
  last_four TEXT,
  color TEXT,
  currency TEXT NOT NULL DEFAULT 'DOP',
  balance NUMERIC(14,2) DEFAULT 0,
  credit_limit NUMERIC(14,2) DEFAULT 0,
  cut_off_day INT,
  payment_due_day INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE TARJETAS DE CRÉDITO
CREATE TABLE IF NOT EXISTS credit_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  bank TEXT NOT NULL,
  card_number_masked TEXT NOT NULL,
  credit_limit NUMERIC(14,2) NOT NULL,
  current_debt NUMERIC(14,2) DEFAULT 0,
  cut_off_day INT NOT NULL,
  payment_due_day INT NOT NULL,
  interest_rate NUMERIC(5,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  color TEXT NOT NULL,
  currency TEXT DEFAULT 'DOP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE MOVIMIENTOS DE TARJETAS DE CRÉDITO
CREATE TABLE IF NOT EXISTS card_movements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  card_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'payment')),
  concept TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  resulting_debt NUMERIC(14,2) NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE PRÉSTAMOS / DEUDAS
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  original_amount NUMERIC(14,2) NOT NULL,
  pending_balance NUMERIC(14,2) NOT NULL,
  monthly_payment NUMERIC(14,2) NOT NULL,
  start_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  interest_rate NUMERIC(5,2),
  total_installments INT NOT NULL,
  paid_installments INT DEFAULT 0,
  remaining_installments INT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ending_soon', 'completed')),
  category TEXT DEFAULT 'personal',
  color TEXT NOT NULL,
  currency TEXT DEFAULT 'DOP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. TABLA DE PAGOS DE PRÉSTAMOS
CREATE TABLE IF NOT EXISTS loan_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  loan_id TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  source_account_id TEXT NOT NULL,
  installment_number INT NOT NULL,
  resulting_balance NUMERIC(14,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE TRANSACCIONES
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DOP',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id TEXT NOT NULL,
  payment_method_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency TEXT,
  due_date TEXT,
  fortnight TEXT DEFAULT 'q1' CHECK (fortnight IN ('q1', 'q2')),
  notes TEXT,
  linked_card_id TEXT,
  is_debt_payment BOOLEAN DEFAULT FALSE,
  linked_loan_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE PRESUPUESTOS
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  monthly_limit NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'DOP',
  month TEXT NOT NULL,
  alert_threshold NUMERIC(5,2) DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLA DE CONFIGURACIÓN DEL USUARIO
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  primary_currency TEXT DEFAULT 'DOP',
  exchange_rate_usd_to_dop NUMERIC(10,4) DEFAULT 60.50,
  theme TEXT DEFAULT 'dark',
  q1_end_day INT DEFAULT 15,
  notifications_allowed BOOLEAN DEFAULT TRUE,
  internal_reminders_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REGLAS DE SEGURIDAD (Row Level Security - RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso total a usuarios según su user_id
CREATE POLICY "Allow all operations for user" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON payment_methods FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON credit_cards FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON card_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON loans FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON loan_payments FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON budgets FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON user_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for user" ON profiles FOR ALL USING (true);
