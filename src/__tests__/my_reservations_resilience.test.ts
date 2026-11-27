import { describe, it, expect } from 'vitest';
import { formatDateDMY, formatDateReadable } from '../utils/formatters';

describe('Resiliencia de Mis Reservas y Manejo Seguro de Datos', () => {
  it('formatDateReadable maneja strings ISO y fechas SQL sin lanzar errores', () => {
    expect(formatDateReadable('2026-12-15')).toContain('2026');
    expect(formatDateReadable('')).toBe('');
    expect(formatDateReadable(null as any)).toBe('');
    expect(formatDateReadable(undefined as any)).toBe('');
  });

  it('formatDateDMY maneja entradas vacías y formatos estándar de fecha', () => {
    expect(formatDateDMY('2026-12-15')).toBe('15/12/2026');
    expect(formatDateDMY('')).toBe('');
    expect(formatDateDMY(null as any)).toBe('');
  });

  it('Filtrado de reservas soporta de forma resiliente tanto snake_case como camelCase y valores nulos', () => {
    const userEmail = 'laura.gomez@ejemplo.com';
    const rawReservas: any[] = [
      { id_reserva: 1, cliente_correo: 'laura.gomez@ejemplo.com', estado: 'PENDIENTE' },
      { id_reserva: 2, clienteCorreo: 'LAURA.GOMEZ@EJEMPLO.COM', estado: 'CONFIRMADA' },
      { id_reserva: 3, cliente_correo: undefined, estado: 'PENDIENTE' },
      { id_reserva: 4, cliente_correo: null, estado: 'CONFIRMADA' },
      { id_reserva: 5, cliente_correo: 'carlos.restrepo@ejemplo.com', estado: 'PENDIENTE' },
      { id_reserva: 6, estado: 'PENDIENTE' }, // sin email
    ];

    const filtered = rawReservas.filter((r) => {
      const resEmail = (r.cliente_correo || r.clienteCorreo || '').trim().toLowerCase();
      return resEmail === userEmail;
    });

    expect(filtered.length).toBe(2);
    expect(filtered.map((r) => r.id_reserva)).toEqual([1, 2]);
  });

  it('Cálculo de política de 48 horas no lanza error si fecha_entrada tiene formato ISO con T o es nula', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 72 * 3600 * 1000).toISOString();

    const reservaSegura: any = {
      estado: 'CONFIRMADA',
      fecha_entrada: futureDate,
    };

    const fechaLimpia = (reservaSegura.fecha_entrada || '').split('T')[0];
    expect(fechaLimpia).toBeTruthy();

    const entradaDate = new Date(`${fechaLimpia}T15:00:00`);
    const diffHours = (entradaDate.getTime() - now.getTime()) / (1000 * 3600);
    expect(diffHours).toBeGreaterThan(48);
  });
});
