import { describe, it, expect } from 'vitest';
import {
  ROLE_PERMISSIONS,
  PUBLIC_VIEWS,
  ADMIN_EXCLUSIVE_VIEWS,
  isViewAllowed,
  hasAdminPrivilege,
  canCancelReservation,
  canRateReservation,
} from '../utils/rbac';
import { RolUsuario, Reserva } from '../types/hotel';

describe('Seguridad Frontend y RBAC - Matriz de Permisos de Vistas', () => {
  it('Define vistas públicas accesibles sin autenticación previa', () => {
    expect(PUBLIC_VIEWS).toContain('inicio');
    expect(PUBLIC_VIEWS).toContain('habitaciones');
    expect(PUBLIC_VIEWS).toContain('disponibilidad');
    expect(PUBLIC_VIEWS).not.toContain('mis-reservas');
    expect(PUBLIC_VIEWS).not.toContain('admin-dashboard');
  });

  it('Define vistas administrativas exclusivas no accesibles a clientes', () => {
    ADMIN_EXCLUSIVE_VIEWS.forEach((view) => {
      expect(ROLE_PERMISSIONS.CLIENTE).not.toContain(view);
      expect(ROLE_PERMISSIONS.ADMINISTRADOR).toContain(view);
    });
  });

  it('isViewAllowed autoriza a ADMINISTRADOR en vistas de gestión y públicas', () => {
    ADMIN_EXCLUSIVE_VIEWS.forEach((adminView) => {
      expect(isViewAllowed(adminView, 'ADMINISTRADOR', true)).toBe(true);
    });
    expect(isViewAllowed('inicio', 'ADMINISTRADOR', true)).toBe(true);
    expect(isViewAllowed('habitaciones', 'ADMINISTRADOR', true)).toBe(true);
  });

  it('isViewAllowed BLOQUEA a CLIENTE en todas las vistas de administración', () => {
    ADMIN_EXCLUSIVE_VIEWS.forEach((adminView) => {
      expect(isViewAllowed(adminView, 'CLIENTE', true)).toBe(false);
    });
  });

  it('isViewAllowed autoriza a CLIENTE autenticado en su área de reservas y catálogo', () => {
    expect(isViewAllowed('mis-reservas', 'CLIENTE', true)).toBe(true);
    expect(isViewAllowed('habitaciones', 'CLIENTE', true)).toBe(true);
    expect(isViewAllowed('disponibilidad', 'CLIENTE', true)).toBe(true);
    expect(isViewAllowed('inicio', 'CLIENTE', true)).toBe(true);
  });

  it('isViewAllowed BLOQUEA vistas privadas si el usuario es un VISITANTE no autenticado', () => {
    // Visitante sin autenticar
    expect(isViewAllowed('mis-reservas', 'CLIENTE', false)).toBe(false);
    expect(isViewAllowed('admin-dashboard', 'ADMINISTRADOR', false)).toBe(false);

    // Vistas públicas sí se permiten
    expect(isViewAllowed('inicio', 'CLIENTE', false)).toBe(true);
    expect(isViewAllowed('habitaciones', 'CLIENTE', false)).toBe(true);
    expect(isViewAllowed('disponibilidad', 'CLIENTE', false)).toBe(true);
  });
});

describe('Seguridad Frontend y RBAC - Autorización de Acciones y Operaciones Sensibles', () => {
  const reservaClienteA: Pick<Reserva, 'cliente_correo'> = {
    cliente_correo: 'laura.gomez@ejemplo.com',
  };

  it('hasAdminPrivilege verifica estrictamente el rol de administrador', () => {
    expect(hasAdminPrivilege('ADMINISTRADOR')).toBe(true);
    expect(hasAdminPrivilege('CLIENTE')).toBe(false);
  });

  it('canCancelReservation permite al administrador cancelar cualquier reserva', () => {
    expect(canCancelReservation('ADMINISTRADOR', 'alvaro@hotelalborada.com', reservaClienteA)).toBe(true);
    expect(canCancelReservation('ADMINISTRADOR', '', reservaClienteA)).toBe(true);
  });

  it('canCancelReservation permite al cliente cancelar ÚNICAMENTE su propia reserva', () => {
    // Dueño legítimo
    expect(canCancelReservation('CLIENTE', 'laura.gomez@ejemplo.com', reservaClienteA)).toBe(true);
    // Case insensitive
    expect(canCancelReservation('CLIENTE', 'LAURA.GOMEZ@EJEMPLO.COM', reservaClienteA)).toBe(true);

    // Tercero no autorizado intentando cancelar
    expect(canCancelReservation('CLIENTE', 'carlos.restrepo@ejemplo.com', reservaClienteA)).toBe(false);
    expect(canCancelReservation('CLIENTE', 'hacker@ejemplo.com', reservaClienteA)).toBe(false);
    expect(canCancelReservation('CLIENTE', '', reservaClienteA)).toBe(false);
  });

  it('canRateReservation impide calificar reservas que pertenecen a otros clientes', () => {
    // Dueño de la reserva
    expect(canRateReservation('CLIENTE', 'laura.gomez@ejemplo.com', reservaClienteA)).toBe(true);

    // Usuario ajeno intentando emitir reseña
    expect(canRateReservation('CLIENTE', 'carlos.restrepo@ejemplo.com', reservaClienteA)).toBe(false);
    expect(canRateReservation('CLIENTE', '', reservaClienteA)).toBe(false);
  });
});
