# Tareas Pendientes

## Pickup Form
- [ ] Crear página `/pedidos` para ver historial y estado de pedidos
- [ ] Panel admin: revisar `custom_stores` y aprobar/rechazar para agregar a stores oficiales
- [ ] Implementar toasts con sonner para mensajes de error/éxito
- [ ] Agregar mapa interactivo para selección de dirección (futuro)
- [ ] Integrar PickupModal en la interfaz principal (junto a BuyModal)

## Buy Form
- [ ] Migrar BuyForm a usar datos reales de stores desde Supabase
- [ ] Reutilizar StoreSelector y AddressSelector en BuyForm

## General
- [ ] Implementar sistema de notificaciones push para drivers
- [ ] Agregar tracking en tiempo real del pedido
- [ ] Crear página de confirmación de pedido con tracking

## Schema / Base de datos
- [ ] Ejecutar migración `20260603000000_pickup_form_schema.sql`
- [ ] Verificar que la tabla `settings` se creó correctamente con `delivery_fee`
- [ ] Crear índice en `orders.client_id` para优化的 consultas de pedidos de usuario