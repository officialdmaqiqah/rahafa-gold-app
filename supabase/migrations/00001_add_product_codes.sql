-- Tambahkan kolom item_code dan system_code ke tabel products
ALTER TABLE products 
  ADD COLUMN item_code VARCHAR(50),
  ADD COLUMN system_code VARCHAR(50);

-- Pastikan unique constraint
ALTER TABLE products ADD CONSTRAINT unique_item_code UNIQUE (item_code);
ALTER TABLE products ADD CONSTRAINT unique_system_code UNIQUE (system_code);

-- Ubah daily_prices agar harga reseller dan buyback boleh NULL
ALTER TABLE daily_prices 
  ALTER COLUMN reseller_sell_price DROP NOT NULL,
  ALTER COLUMN buyback_price DROP NOT NULL;
