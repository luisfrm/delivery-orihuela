/**
 * Configuración del botón de refresco manual.
 * Se comparte entre el panel admin (`/panel/orders`) y la página de pedidos
 * del cliente (`/pedidos`). Sin realtime: el usuario actualiza los datos bajo
 * demanda, con un cooldown para evitar peticiones excesivas.
 */
export const REFRESH_CONFIG = {
  /** Duración del cooldown en segundos. */
  cooldownSeconds: 10,
  /** Duración del cooldown en milisegundos (derivado). */
  cooldownMs: 10_000,
} as const
