// Type definitions for FarmConnect marketplace

export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  farm_name: string;
  farm_size?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  certifications?: string[];
  description?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Market {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone?: string;
  contact_person?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  delivery_preferences?: string[];
  order_volume?: string;
  description?: string;
  profile_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transporter {
  id: string;
  company_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  vehicle_type: string;
  vehicle_capacity?: string;
  has_refrigeration: boolean;
  license_plate?: string;
  insurance_number?: string;
  base_rate: number;
  per_km_rate: number;
  refrigeration_premium: number;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProduceCategory {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface ProduceListing {
  id: string;
  farmer_id: string;
  category_id: string;
  name: string;
  description?: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  minimum_order: number;
  is_organic: boolean;
  is_seasonal: boolean;
  season_start?: string;
  season_end?: string;
  image_url?: string;
  is_active: boolean;
  farmer?: Farmer;
  category?: ProduceCategory;
}

export interface Order {
  id: string;
  market_id: string;
  farmer_id: string;
  transporter_id?: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  total_amount: number;
  transport_cost?: number;
  delivery_date?: string;
  delivery_time?: string;
  pickup_address?: string;
  delivery_address?: string;
  distance_km?: number;
  notes?: string;
  items?: OrderItem[];
  farmer?: Farmer;
  market?: Market;
  transporter?: Transporter;
}

export interface OrderItem {
  id: string;
  order_id: string;
  produce_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  produce?: ProduceListing;
}

export interface CartItem {
  produce: ProduceListing;
  quantity: number;
}

export type UserRole = 'farmer' | 'market' | 'transporter' | null;

export interface TransportQuote {
  transporter: Transporter;
  distance_km: number;
  base_cost: number;
  distance_cost: number;
  refrigeration_cost: number;
  total_cost: number;
  estimated_time: string;
}
