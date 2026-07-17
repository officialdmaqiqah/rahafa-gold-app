-- Initial Schema for Rahafa Stock & Invoice (Updated with Blueprint Specs)

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. users / profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    whatsapp_number VARCHAR(50) UNIQUE NOT NULL,
    whatsapp_number_normalized VARCHAR(50) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'kasir')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. user_sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    revoked_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 3. products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('gold', 'silver')),
    type VARCHAR(100),
    weight DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'gram',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('general', 'reseller')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. stock_batches (Stok Detail Modal)
CREATE TABLE stock_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('supplier', 'buyback', 'opening_stock', 'adjustment')),
    source_ref_id UUID, -- Optional link to transactions(id) if buyback
    date_in DATE NOT NULL,
    quantity_in INTEGER NOT NULL,
    quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
    cost_price DECIMAL(15, 2) NOT NULL,
    supplier_name VARCHAR(255),
    customer_id UUID REFERENCES customers(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('ready', 'hold', 'sold_out', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_stock_batches_product_id ON stock_batches(product_id);

-- 6. daily_prices
CREATE TABLE daily_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    date DATE NOT NULL,
    retail_sell_price DECIMAL(15, 2) NOT NULL,
    reseller_sell_price DECIMAL(15, 2) NOT NULL,
    buyback_price DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_daily_prices_product_id ON daily_prices(product_id);
CREATE INDEX idx_daily_prices_date ON daily_prices(date);

-- 7. transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('sale_general', 'sale_reseller', 'buyback')),
    customer_id UUID REFERENCES customers(id),
    transaction_date DATE NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL,
    remaining_amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'final', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);

-- 8. transaction_items
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    stock_batch_id UUID REFERENCES stock_batches(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    cost_price DECIMAL(15, 2) NOT NULL,
    profit DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);

-- 9. settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    phone VARCHAR(50),
    logo_url TEXT,
    invoice_prefix VARCHAR(20) DEFAULT 'INV',
    buyback_prefix VARCHAR(20) DEFAULT 'BB',
    invoice_footer TEXT,
    minimum_margin_amount DECIMAL(15, 2),
    minimum_margin_percent DECIMAL(5, 2),
    owner_override_pin_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Basic RLS setup (Assuming we use server-side execution mostly, but good practice to close access from client)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
