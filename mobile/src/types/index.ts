export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  gender?: string;
  date_of_birth?: string;
  email_verified_at?: string;
  default_address?: Address;
}

export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  is_default: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  icon?: string;
  is_featured: boolean;
  children?: Category[];
  products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  value: string;
  sku?: string;
  price_modifier: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  specifications?: Record<string, string>;
  price: number;
  discount_price?: number;
  effective_price: number;
  discount_percentage: number;
  stock_quantity: number;
  in_stock: boolean;
  thumbnail_url?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
  brand?: Brand;
  average_rating: number;
  review_count: number;
  sold_count: number;
  is_featured: boolean;
  is_flash_sale: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  tags?: string[];
}

export interface CartItem {
  id: number;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  items_count: number;
  total: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id: number;
  reference: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  channel?: string;
  paid_at?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string;
  notes?: string;
  cancellation_reason?: string;
  delivery: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  items: OrderItem[];
  payment?: Payment;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
}

export interface Review {
  id: number;
  user: { id: number; name: string; avatar_url?: string };
  rating: number;
  title?: string;
  body?: string;
  images: string[];
  admin_reply?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link?: string;
  type: string;
  button_text?: string;
  bg_color?: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  data?: Record<string, any>;
  image?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
