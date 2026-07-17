CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: using gen_random_uuid() instead of extensions.uuid_generate_v4() for compatibility.
-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cash_transactions
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
