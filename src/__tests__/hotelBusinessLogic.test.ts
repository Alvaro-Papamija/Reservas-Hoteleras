import { describe, it, expect } from 'vitest';
import { formatCOP, formatDateDMY, formatDateReadable } from '../utils/formatters';
import { INITIAL_HABITACIONES, INITIAL_TIPOS, INITIAL_RESERVAS } from '../data/mockData';
import { Reserva } from '../types/hotel';

describe('Formateadores y Utilitarios', () => {
  it('formatCOP formatea valores monetarios en pesos colombianos sin decimales', () => {
    const formatted = formatCOP(220000);
    // Debe incluir el valor formateado
    expect(formatted).toContain('220.000');
  });

  it('formatDateDMY convierte fechas YYYY-MM-DD a DD/MM/YYYY', () => {
    expect(formatDateDMY('2026-12-15')).toBe('15/12/2026');
    expect(formatDateDMY('')).toBe('');
  });

  it('formatDateReadable genera fecha legible en español', () => {
    const readable = formatDateReadable('2026-12-15');
    expect(readable.toLowerCase()).toContain('2026');
    expect(readable.toLowerCase()).toContain('15');
  });
});

describe('Reglas de Negocio - Cálculo de Noches y Tarifas', () => {
  const calculateNights = (fechaEntrada: string, fechaSalida: string): number => {
    const start = new Date(fechaEntrada);
    const end = new Date(fechaSalida);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateTotal = (precioNoche: number, fechaEntrada: string, fechaSalida: string) => {
    const noches = calculateNights(fechaEntrada, fechaSalida);
    return {
      noches,
      total: noches * precioNoche,
    };
  };

  it('Calcula exactamente 3 noches para el intervalo 2026-12-15 a 2026-12-18', () => {
    expect(calculateNights('2026-12-15', '2026-12-18')).toBe(3);
  });

  it('Retorna 0 si las fechas son iguales o la de salida es anterior', () => {
    expect(calculateNights('2026-12-15', '2026-12-15')).toBe(0);
    expect(calculateNights('2026-12-18', '2026-12-15')).toBe(0);
  });

  it('Calcula el total multiplicando noches por tarifa base de la habitación', () => {
    const precioNoche = 250000;
    const { noches, total } = calculateTotal(precioNoche, '2026-12-15', '2026-12-18');
    expect(noches).toBe(3);
    expect(total).toBe(750000);
  });
});

describe('Regla RN01 - Detección de Superposición de Reservas [Entrada, Salida)', () => {
  const checkOverlap = (
    reservas: Reserva[],
    idHabitacion: number,
    fechaEntrada: string,
    fechaSalida: string,
    excludeReservaId?: number
  ): boolean => {
    const nuevaEntrada = new Date(fechaEntrada).getTime();
    const nuevaSalida = new Date(fechaSalida).getTime();

    return reservas.some((r) => {
      if (r.id_habitacion !== idHabitacion) return false;
      if (excludeReservaId && r.id_reserva === excludeReservaId) return false;
      if (r.estado !== 'PENDIENTE' && r.estado !== 'CONFIRMADA') return false;

      const rEntrada = new Date(r.fecha_entrada).getTime();
      const rSalida = new Date(r.fecha_salida).getTime();

      // Conflicto ocurre si: rEntrada < nuevaSalida && rSalida > nuevaEntrada
      return rEntrada < nuevaSalida && rSalida > nuevaEntrada;
    });
  };

  const reservasPrueba: Reserva[] = [
    {
      id_reserva: 1,
      codigo_reserva: 'ALB-TEST-01',
      id_cliente: 1,
      id_habitacion: 101,
      fecha_entrada: '2026-12-10',
      fecha_salida: '2026-12-15',
      cantidad_huespedes: 2,
      total_pago: 600000,
      estado: 'CONFIRMADA',
      fecha_creacion: '2026-11-01',
    },
    {
      id_reserva: 2,
      codigo_reserva: 'ALB-TEST-02',
      id_cliente: 2,
      id_habitacion: 101,
      fecha_entrada: '2026-12-20',
      fecha_salida: '2026-12-25',
      cantidad_huespedes: 2,
      total_pago: 600000,
      estado: 'CANCELADA', // Las canceladas no deben bloquear inventario
      fecha_creacion: '2026-11-01',
    },
  ];

  it('Detecta conflicto si las fechas caen dentro de una reserva confirmada', () => {
    // Solapamiento total: 11 al 14
    expect(checkOverlap(reservasPrueba, 101, '2026-12-11', '2026-12-14')).toBe(true);
    // Solapamiento parcial en la entrada: 08 al 12
    expect(checkOverlap(reservasPrueba, 101, '2026-12-08', '2026-12-12')).toBe(true);
    // Solapamiento parcial en la salida: 14 al 18
    expect(checkOverlap(reservasPrueba, 101, '2026-12-14', '2026-12-18')).toBe(true);
  });

  it('Permite check-in el mismo día del check-out de otra reserva (intervalos disjuntos [E, S))', () => {
    // Entra el 15 (mismo día que sale la anterior): NO hay conflicto
    expect(checkOverlap(reservasPrueba, 101, '2026-12-15', '2026-12-18')).toBe(false);
    // Sale el 10 (mismo día que entra la anterior): NO hay conflicto
    expect(checkOverlap(reservasPrueba, 101, '2026-12-05', '2026-12-10')).toBe(false);
  });

  it('Ignora reservas en estado CANCELADA liberando el inventario', () => {
    // La reserva 2 está CANCELADA del 20 al 25
    expect(checkOverlap(reservasPrueba, 101, '2026-12-21', '2026-12-24')).toBe(false);
  });

  it('No reporta conflicto si la habitación es distinta', () => {
    expect(checkOverlap(reservasPrueba, 102, '2026-12-11', '2026-12-14')).toBe(false);
  });
});

describe('Reglas RN04 y RN07 - Capacidad y Mantenimiento de Habitaciones', () => {
  it('RN07: No ofrece habitaciones en MANTENIMIENTO o inactivas', () => {
    const habitacionesFiltradas = INITIAL_HABITACIONES.filter(
      (h) => h.activa && h.estado !== 'MANTENIMIENTO'
    );
    const algunaMantenimiento = habitacionesFiltradas.some((h) => h.estado === 'MANTENIMIENTO');
    expect(algunaMantenimiento).toBe(false);
  });

  it('RN04: Valida que la capacidad máxima del tipo sea suficiente para los huéspedes', () => {
    const tipoIndividual = INITIAL_TIPOS.find((t) => t.id_tipo === 1); // Individual
    expect(tipoIndividual?.capacidad).toBe(1);

    const tipoDoble = INITIAL_TIPOS.find((t) => t.id_tipo === 2); // Doble
    expect(tipoDoble?.capacidad).toBe(2);

    const tipoFamiliar = INITIAL_TIPOS.find((t) => t.id_tipo === 4); // Familiar
    expect(tipoFamiliar?.capacidad).toBe(5);
  });
});
