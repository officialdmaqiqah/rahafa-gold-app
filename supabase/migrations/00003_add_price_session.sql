-- Tambahkan kolom session_name pada daily_prices
ALTER TABLE daily_prices 
ADD COLUMN session_name VARCHAR(100);

-- Update data yang sudah ada dengan "Sesi 1"
UPDATE daily_prices
SET session_name = 'Sesi 1'
WHERE session_name IS NULL;

-- Opsional: Jadikan not null setelah update
-- ALTER TABLE daily_prices ALTER COLUMN session_name SET NOT NULL;
