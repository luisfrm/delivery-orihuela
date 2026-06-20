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
  order_number: number
  client_id: string
  rider_id: string | null
  store_id: string | null
  custom_store_name: string | null
  custom_store_address: string | null
  address_id: string | null
  delivery_address_name: string | null
  delivery_address_line: string | null
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
  product_id: string | null
  product_name: string | null
  product_picture_url: string | null
  quantity: number
  estimated_unit_price: number
  created_at: string
  updated_at: string
}

export interface OrderItemWithProduct {
  id: string
  order_id: string
  product_id: string | null
  product_name: string | null
  product_picture_url: string | null
  quantity: number
  estimated_unit_price: number
}

export interface OrderWithDetails extends Order {
  items: OrderItemWithProduct[]
  deliveryAddress: { name: string; address_line: string } | null
  storeName: string | null
}

// ─── Vistas específicas para cliente ────────────────────────────
// OrderWithDetails es la fila completa del servidor.
// ActiveOrderData y OrderHistoryData son las formas optimizadas
// para cada vista del cliente. TypeScript no deja pasar el tipo
// equivocado a cada componente.

export interface ActiveOrderData {
  id: string
  order_number: number
  created_at: string
  status: OrderStatus
  service_type: ServiceType
  rider_id: string | null

  custom_store_name: string | null
  storeName: string | null
  deliveryAddress: { name: string; address_line: string } | null

  items: {
    id: string
    product_name: string | null
    product_picture_url: string | null
    quantity: number
    estimated_unit_price: number
  }[]

  additional_notes: string | null
  total_amount: number
}

export interface OrderHistoryData {
  id: string
  created_at: string
  status: OrderStatus
  service_type: ServiceType

  custom_store_name: string | null
  storeName: string | null
  deliveryAddress: { name: string } | null

  items: {
    id: string
    product_name: string | null
    quantity: number
    estimated_unit_price: number
  }[]

  additional_notes: string | null
  total_amount: number
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