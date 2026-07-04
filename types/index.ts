export type ProductStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'archived';
export type ProductCondition = 'new' | 'excellent' | 'good' | 'fair';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  r2_key: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  brand_id: string | null;
  condition: ProductCondition;
  size: string | null;
  color: string | null;
  status: ProductStatus;
  view_count: number;
  sold_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
}

export interface WaitlistEntry {
  id: string;
  product_id: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface BagItem {
  product_id: string;
  slug: string;
  title: string;
  price: number;
  image_url: string;
  size: string | null;
  brand_name: string | null;
}
