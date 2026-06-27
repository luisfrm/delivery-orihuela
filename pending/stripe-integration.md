# Stripe Integration Plan

> Plan de integración de Stripe como método de pago, complementando el
> sistema actual de métodos custom. Documento pendiente de aprobación
> antes de implementar.

## Contexto

El proyecto ya tiene un sistema de métodos de pago donde:

- El admin define métodos con campos dinámicos (text/image/visual) en
  `/panel/settings`
- El cliente selecciona un método en checkout y llena los campos
- El server guarda un snapshot completo en `orders.payment_values`

Este sistema funciona bien para métodos como transferencia bancaria,
Pago Móvil, Bizum, etc. Pero para pagos con tarjeta de crédito/débito
se necesita un procesador de pagos real (Stripe) que:

- Maneje los datos de tarjeta de forma PCI-compliant
- Procese el cargo al cliente
- Envíe webhooks de confirmación
- Maneje refunds y disputas

## Objetivo

Agregar Stripe como **4to tipo de método de pago** que coexiste con
los métodos custom. El admin puede crear un método "Pago con tarjeta"
de tipo Stripe. El cliente lo selecciona, introduce los datos de su
tarjeta via Stripe Elements, y Stripe procesa el cargo.

El sistema actual NO se reemplaza. Métodos custom (transferencia, Pago
Móvil, etc.) siguen funcionando igual. Solo se agrega Stripe como opción
adicional.

## Decisiones pendientes del usuario

Antes de implementar, el usuario debe confirmar:

- [ ] Costo de Stripe aceptable (~2.9% + 0.30€ por transacción)
- [ ] Refunds desde el panel admin o solo desde dashboard de Stripe
- [ ] Custom + Stripe coexisten (recomendado: sí)
- [ ] Solo EUR o multi-moneda
- [ ] IdempotencyKey por orden (recomendado: sí)
- [ ] Polling en cliente mientras se procesa el webhook
- [ ] Hacer todo de una vez (~10 días) o empezar con POC
- [ ] Cuenta de Stripe ya existe o hay que crearla

## Lo que necesitamos

### 1. Setup externo (no es código)

- **Cuenta de Stripe** (gratis para test)
- **API keys** (en `.env.local`):
  - `STRIPE_SECRET_KEY` (server-side, secreto)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side, público)
  - `STRIPE_WEBHOOK_SECRET` (para verificar webhooks)
- **Webhook endpoint** configurado en dashboard de Stripe apuntando a
  `https://<dominio>/api/webhooks/stripe`
- **Moneda**: EUR (consistente con el proyecto)

### 2. Dependencias (npm)

```json
{
  "dependencies": {
    "stripe": "^17.0.0",
    "@stripe/stripe-js": "^4.0.0",
    "@stripe/react-stripe-js": "^3.0.0"
  }
}
```

### 3. Cambios en la DB (nueva migración)

```sql
-- Tracking del pago Stripe en orders
alter table orders
  add column payment_intent_id text,         -- Stripe's pi_xxx
  add column payment_status text,            -- 'pending' | 'succeeded' | 'failed' | 'refunded'
  add column payment_card_brand text,        -- 'visa' | 'mastercard' | 'amex'
  add column payment_card_last4 text;        -- '4242'

-- Para distinguir métodos custom vs system (Stripe)
alter table payment_methods
  add column is_system boolean not null default false,
  add column provider text;  -- 'stripe' | null
```

### 4. Archivos nuevos

```
lib/
  stripe/
    server.ts                # Stripe SDK server-side instance
    client.ts                # Stripe.js client-side loader
    webhook.ts               # Webhook signature verification
  actions/
    stripe.ts                # createPaymentIntent, confirmPayment

app/
  api/
    webhooks/
      stripe/
        route.ts              # POST /api/webhooks/stripe (webhook handler)

components/
  checkout/
    StripePaymentElement.tsx # Wrapper de <Elements> + <PaymentElement>
  admin/
    orders/
      detail/
        StripePaymentStatus.tsx # Estado del pago Stripe en admin detail
```

### 5. Cambios en archivos existentes

| Archivo | Cambio |
|---|---|
| `lib/types/payment-methods.ts` | Agregar `"stripe"` al type union, flag `isSystem: boolean` en `PaymentMethod` |
| `lib/types.ts` (Order interface) | Agregar `paymentIntentId`, `paymentStatus`, `paymentCardBrand`, `paymentCardLast4` |
| `lib/services/orders.service.ts` | `createOrder` modificado: si método es stripe, crear PaymentIntent, devolver `clientSecret` |
| `lib/actions/payment-methods.ts` | Acciones admin para gestionar método stripe (limitado, no se puede editar) |
| `components/forms/PaymentMethodSelect.tsx` | Detectar método stripe → render `<StripePaymentElement>` en vez de custom fields |
| `components/forms/BuyForm.tsx`, `PickupForm.tsx` | State para `stripeClientSecret`, lógica post-createOrder |
| `components/admin/orders/detail/OrderPaymentMethodCard.tsx` | Si método es stripe, mostrar estado + last4 (en vez de fields) |
| `components/admin/orders/OrdersTable.tsx` | Columna "Pago" muestra "Tarjeta •••• 1234" o método custom |
| `components/orders/ActiveOrderCard.tsx`, `OrderHistoryListItem.tsx` | Mostrar tipo de pago según método |

### 6. Flujo del usuario con Stripe

```
[1] Usuario en checkout selecciona "Pago con tarjeta"
[2] Se renderiza Stripe Elements (formulario seguro de tarjeta)
[3] Usuario llena datos de tarjeta (PCI-compliant via Stripe)
[4] Click "Confirmar pedido"
    → Server crea el order + PaymentIntent
    → Devuelve clientSecret
[5] Client confirma el pago con Stripe
[6] Stripe procesa el pago
[7] Webhook → server actualiza order.payment_status = 'succeeded'
[8] Cliente ve el pedido con "Pagado con tarjeta •••• 1234"
```

### 7. Flujo del admin con Stripe

- Crear método "Pago con tarjeta" desde `/panel/settings`
- Se marca automáticamente como `isSystem: true, provider: 'stripe'`
- No se puede editar la estructura (Stripe Elements la maneja)
- En `/panel/orders`: ver estado del pago + last 4 dígitos
- En el detalle del order: link al PaymentIntent en dashboard de Stripe

## Fases de implementación (orden de prioridad)

| # | Fase | Duración estimada | Descripción |
|---|---|---|---|
| 1 | Infraestructura | ~1 día | Cuenta Stripe, API keys, env vars, webhook setup local con Stripe CLI |
| 2 | Server-side | ~2 días | Stripe SDK, `createPaymentIntent`, webhook handler con verificación de firma |
| 3 | DB migration | ~0.5 días | Nuevas columnas en `orders` y `payment_methods` |
| 4 | Admin UI | ~1 día | Seed del método "Pago con tarjeta" automático, gestión limitada en settings |
| 5 | Client UI | ~2 días | `StripePaymentElement`, integración con `PaymentMethodSelect` |
| 6 | Order flow | ~2 días | Modificar `createOrder`, manejar flujo async de Stripe, idempotency |
| 7 | Testing & polish | ~1 día | Test mode, edge cases, errores, polish UI |

**Total estimado: ~10 días de trabajo**

## Tradeoffs y consideraciones

1. **Costo de Stripe**: ~2.9% + 0.30€ por transacción exitosa
2. **Webhook reliability**: Stripe reintenta hasta 3 días si el server está down. Considerar polling en cliente durante el procesamiento.
3. **PCI compliance**: Al usar Stripe Elements, NO manejamos datos de tarjeta raw. Stripe sí es PCI-compliant.
4. **Testing**: Stripe test mode con tarjetas como `4242 4242 4242 4242` (success) y `4000 0000 0000 0002` (decline). Usar Stripe CLI para webhooks en local.
5. **Currency**: EUR. Solo configurar `currency: 'eur'` en PaymentIntent.
6. **Idempotency**: Usar `idempotencyKey` único por orden (basado en order ID) para evitar cargos duplicados.
7. **Refunds**: Depende de la decisión del usuario (admin panel o dashboard de Stripe).
8. **Custom + Stripe coexisten**: Ambos tipos funcionan independientemente. El discriminador es el `provider` del método.
9. **PaymentIntent vs Checkout Session**: Recomiendo PaymentIntent + Elements (más control de UI, consistente con el sistema actual).

## Plan de commits (cuando se implemente)

1. `feat(db): add Stripe columns to orders and payment_methods` (migración)
2. `feat(stripe): add server-side Stripe SDK and createPaymentIntent action` (server)
3. `feat(stripe): add webhook handler with signature verification` (webhook)
4. `feat(stripe): add StripePaymentElement component for client` (client)
5. `feat(stripe): integrate Stripe payment in checkout flow` (BuyForm/PickupForm)
6. `feat(stripe): seed default Stripe payment method` (admin)
7. `feat(admin): show Stripe payment status in order detail` (admin UI)
8. `feat(client): show payment type in /pedidos orders` (client UI)
