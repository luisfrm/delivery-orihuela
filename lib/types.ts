import type { PaymentFieldValue } from "@/lib/types/payment-methods"

export type UserRole = "admin" | "rider" | "user"
export type StaffRole = Extract<UserRole, "admin" | "rider">
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

/**
 * Usuario completo (auth.users + user_profiles joined en memoria).
 * El role vive en auth.users.app_metadata (server-only, NO en user_profiles).
 */
export interface UserWithProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: UserRole
  /** created_at del user_profiles */
  created_at: string
  /** created_at del auth.users */
  auth_created_at: string
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
  payment_method_id: string | null
  payment_method_name: string | null
  payment_values: PaymentFieldValue[]
  created_at: string
  updated_at: string
  /**
   * Store name from the joined stores table. Populated by the admin
   * panel queries. Optional because not all queries join stores.
   */
  storeName?: string | null
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
  rider: RiderContact | null
}

export interface OrderWithClient extends OrderWithDetails {
  client: ClientContact | null
}

export interface RiderContact {
  id: string
  first_name: string
  last_name: string
  phone: string
}

export interface ClientContact {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
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
  items_estimated_cost: number
  delivery_fee: number
  total_amount: number
  paymentMethodId: string | null
  paymentMethodName: string | null
  paymentValues: PaymentFieldValue[]
  rider: RiderContact | null
}

export interface OrderHistoryData {
  id: string
  order_number: number
  created_at: string
  status: OrderStatus
  service_type: ServiceType

  custom_store_name: string | null
  storeName: string | null

  deliveryAddress: { name: string; address_line: string } | null

  items: {
    id: string
    product_name: string | null
    quantity: number
    estimated_unit_price: number
  }[]

  additional_notes: string | null
  items_estimated_cost: number
  delivery_fee: number
  total_amount: number
  paymentMethodId: string | null
  paymentMethodName: string | null
  paymentValues: PaymentFieldValue[]
  rider: RiderContact | null
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