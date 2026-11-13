import { RolUsuario, Reserva } from '../types/hotel';

export type AppView =
  | 'inicio'
  | 'habitaciones'
  | 'disponibilidad'
  | 'mis-reservas'
  | 'admin-dashboard'
  | 'admin-habitaciones'
  | 'admin-reservas'
  | 'admin-clientes'
  | 'admin-reportes'
  | 'admin-calendario';

/**
 * Matriz de acceso a vistas por rol (Role-Based Access Control)
 */
export const ROLE_PERMISSIONS: Record<RolUsuario, readonly AppView[]> = {
  ADMINISTRADOR: [
    'admin-dashboard',
    'admin-habitaciones',
    'admin-reservas',
    'admin-calendario',
    'admin-clientes',
    'admin-reportes',
    'inicio',
    'habitaciones',
    'disponibilidad',
    'mis-reservas',
  ],
  CLIENTE: [
    'inicio',
    'habitaciones',
    'disponibilidad',
    'mis-reservas',
  ],
};

/**
 * Vistas de acceso totalmente público (sin requerir autenticación)
 */
export const PUBLIC_VIEWS: readonly AppView[] = [
  'inicio',
  'habitaciones',
  'disponibilidad',
];

/**
 * Vistas de gestión exclusiva para administradores
 */
export const ADMIN_EXCLUSIVE_VIEWS: readonly AppView[] = [
  'admin-dashboard',
  'admin-habitaciones',
  'admin-reservas',
  'admin-calendario',
  'admin-clientes',
  'admin-reportes',
];

/**
 * Comprueba si un rol y estado de autenticación tiene permiso para una vista dada
 */
export function isViewAllowed(
  view: string,
  role: RolUsuario,
  isAuthenticated: boolean = true
): boolean {
  // Las vistas públicas siempre están permitidas
  if (PUBLIC_VIEWS.includes(view as AppView)) {
    return true;
  }

  // Si no está autenticado, solo puede ver vistas públicas
  if (!isAuthenticated) {
    return false;
  }

  // Verificar en la matriz del rol
  const allowedViews = ROLE_PERMISSIONS[role] || [];
  return allowedViews.includes(view as AppView);
}

/**
 * Comprueba si el rol actual tiene privilegios de administrador
 */
export function hasAdminPrivilege(role: RolUsuario): boolean {
  return role === 'ADMINISTRADOR';
}

/**
 * Valida si un usuario tiene permiso para cancelar una reserva específica
 * - Administradores pueden cancelar cualquier reserva
 * - Clientes solo pueden cancelar sus propias reservas
 */
export function canCancelReservation(
  role: RolUsuario,
  userEmail: string,
  reserva: Pick<Reserva, 'cliente_correo'>
): boolean {
  if (role === 'ADMINISTRADOR') return true;
  if (!userEmail) return false;
  return userEmail.trim().toLowerCase() === reserva.cliente_correo.trim().toLowerCase();
}

/**
 * Valida si un usuario tiene permiso para calificar una estancia
 */
export function canRateReservation(
  role: RolUsuario,
  userEmail: string,
  reserva: Pick<Reserva, 'cliente_correo'>
): boolean {
  if (!userEmail) return false;
  return userEmail.trim().toLowerCase() === reserva.cliente_correo.trim().toLowerCase();
}
