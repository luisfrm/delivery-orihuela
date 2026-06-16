export type UserRole = "admin" | "rider" | "user"
export type ServiceType = "buy_and_deliver" | "pickup_only"
export type OrderStatus = "pending" | "assigned" | "at_customer" | "on_the_way" | "delivered" | "cancelled"

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface UserAddress {
  id: string
  user_id: string
  name: string
  address_line: string
  city: string
  pickup_reference_notes: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  slug: string
  name: string
  address: string
  phone: string
  cover_image_url: string | null
  logo_url: string | null
  description: string | null
  category_ids: string | null
  menu_category_order: string | null
  created_at: string
  updated_at: string
}

export interface StoreWithMetadata extends Omit<Store, "category_ids"> {
  active_items_count: number
  category_ids: string[]
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  description: string | null
  picture_url: string | null
  /** Price in cents. 100 = 1€. Display with Intl.NumberFormat. */
  estimated_price: number
  is_active: boolean
  menu_category: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  category_id: string
  product_id: string
}

export interface Order {
  id: string
  client_id: string
  rider_id: string | null
  store_id: string | null
  custom_store_name: string | null
  custom_store_address: string | null
  service_type: ServiceType
  status: OrderStatus
  pickup_reference: string | null
  additional_notes: string | null
  items_estimated_cost: number
  delivery_fee: number
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  estimated_unit_price: number
  created_at: string
  updated_at: string
}

export interface CustomStore {
  id: string
  name: string
  address: string
  suggested_by: string
  reviewed: boolean
  created_at: string
}

export interface Setting {
  key: string
  value: string
  updated_at: string
}