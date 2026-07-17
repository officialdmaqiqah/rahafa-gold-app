export type Role = 'owner' | 'admin' | 'kasir';
export type ProductCategory = 'gold' | 'silver';
export type CustomerType = 'general' | 'reseller';
export type StockSourceType = 'supplier' | 'buyback' | 'opening_stock' | 'adjustment';
export type StockStatus = 'ready' | 'hold' | 'sold_out' | 'cancelled';
export type PriceStatus = 'draft' | 'active' | 'archived';
export type TransactionType = 'sale_general' | 'sale_reseller' | 'buyback';
export type TransactionStatus = 'draft' | 'final' | 'cancelled';

export interface User {
  id: string; // UUID
  name: string;
  whatsapp_number: string;
  whatsapp_number_normalized: string;
  pin_hash: string;
  role: Role;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string; // UUID
  user_id: string; // UUID
  session_token_hash: string;
  expires_at: string;
  created_at: string;
  revoked_at?: string;
}

export interface Product {
  id: string; // UUID
  name: string;
  category: ProductCategory;
  type?: string;
  weight: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string; // UUID
  name: string;
  phone?: string;
  address?: string;
  customer_type: CustomerType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockBatch {
  id: string; // UUID
  product_id: string; // UUID
  source_type: StockSourceType;
  source_ref_id?: string; // UUID
  date_in: string;
  quantity_in: number;
  quantity_remaining: number;
  cost_price: number;
  supplier_name?: string;
  customer_id?: string; // UUID
  status: StockStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyPrice {
  id: string; // UUID
  product_id: string; // UUID
  date: string;
  retail_sell_price: number;
  reseller_sell_price: number;
  buyback_price: number;
  status: PriceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string; // UUID
  transaction_number: string;
  transaction_type: TransactionType;
  customer_id?: string; // UUID
  transaction_date: string;
  total_amount: number;
  amount_paid: number;
  remaining_amount: number;
  payment_method?: string;
  status: TransactionStatus;
  notes?: string;
  created_by?: string; // UUID
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string; // UUID
  transaction_id: string; // UUID
  product_id: string; // UUID
  stock_batch_id?: string; // UUID
  quantity: number;
  unit_price: number;
  cost_price: number;
  profit: number;
  notes?: string;
  created_at: string;
}

export interface Settings {
  id: string; // UUID
  store_name: string;
  tagline?: string;
  phone?: string;
  logo_url?: string;
  invoice_prefix: string;
  buyback_prefix: string;
  invoice_footer?: string;
  minimum_margin_amount?: number;
  minimum_margin_percent?: number;
  owner_override_pin_hash?: string;
  created_at: string;
  updated_at: string;
}
