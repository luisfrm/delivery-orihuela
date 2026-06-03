# Tareas Pendientes

## Pickup Form
- [ ] Crear página `/pedidos` para ver historial y estado de pedidos
- [ ] Panel admin: revisar `custom_stores` y aprobar/rechazar para agregar a stores oficiales
- [ ] Agregar mapa interactivo para selección de dirección (futuro)
- [ ] Integrar PickupModal en la interfaz principal (junto a BuyModal)

## Buy Form
- [ ] Migrar BuyForm a usar datos reales de stores desde Supabase
- [ ] Reutilizar StoreSelector y AddressSelector en BuyForm

## General
- [ ] Implementar sistema de notificaciones push para drivers
- [ ] Agregar tracking en tiempo real del pedido
- [ ] Crear página de confirmación de pedido con tracking

## Autenticación
- [x] Flujo de registro con OTP mejorado
- [x] Pantalla de éxito con auto-advance (3 segundos)
- [x] Componente input-otp de shadcn con wrapper reutilizable
- [x] Componente OtpStep compartido entre login y registro
- [x] Detección de email no confirmado en login
- [x] Reenvío automático de OTP al hacer login con email no verificado
- [x] Sistema de toast notifications con sonner (bottom-right)
- [x] Toasts en login, registro y verificación OTP
- [ ] Personalizar estilos de toasts (colores, iconos)
- [ ] Implementar "olvidé mi contraseña"

## Schema / Base de datos
- [ ] Ejecutar migración `20260603000000_pickup_form_schema.sql`
- [ ] Verificar que la tabla `settings` se creó correctamente con `delivery_fee`
- [ ] Crear índice en `orders.client_id` para optimizar consultas de pedidos de usuario