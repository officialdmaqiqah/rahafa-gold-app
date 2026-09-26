-- Seed data for Rahafa Stock & Invoice

-- Insert the owner user
INSERT INTO users (
    id, 
    name, 
    whatsapp_number, 
    whatsapp_number_normalized, 
    pin_hash, 
    role, 
    is_active
) VALUES (
    gen_random_uuid(), 
    'Owner Rahafa', 
    '0851-8807-1133', 
    '6285188071133', 
    '$2b$10$O9yDicpWxSH3EDyCF6ahB.XNQV14zGotSSayhlow4.slwK93kjsV6', -- Hash of '123456'
    'owner', 
    true
)
ON CONFLICT (whatsapp_number) DO NOTHING;
