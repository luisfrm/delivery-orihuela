export type UserRole = "admin" | "driver" | "user"
export type ServiceType = "buy_and_deliver" | "pickup_only"
export type OrderStatus = "pending" | "assigned" | "at_store" | "on_the_way" | "delivered" | "cancelled"

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  phone: string
  role: UserRole
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
  name: string
  address: string
  phone: string
  created_at: string
  updated_at: string
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
  picture_url: string | null
  estimated_price: number
  is_active: boolean
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
  driver_id: string | null
  store_id: string | null
  custom_store_name: string | null
  custom_store_address: string | null
  service_type: ServiceType
  status: OrderStatus
  pickup_reference: string | null
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