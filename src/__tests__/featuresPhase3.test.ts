import { describe, it, expect } from 'vitest';
import { INITIAL_CUPONES, INITIAL_RESENAS } from '../data/mockData';
import { Cupon, Resena } from '../types/hotel';

describe('Fase 3: Sistema de Cupones y Descuentos', () => {
  it('contiene los cupones iniciales preconfigurados', () => {
    expect(INITIAL_CUPONES.length).toBeGreaterThanOrEqual(4);
    const codigos = INITIAL_CUPONES.map((c) => c.codigo);
    expect(codigos).toContain('ALBORADA10');
    expect(codigos).toContain('BIENVENIDA20');
    expect(codigos).toContain('ESCAPADA50K');
    expect(codigos).toContain('VIP30');
  });

  it('aplica correctamente el cupón de porcentaje ALBORADA10 (10%)', () => {
    const cupon = INITIAL_CUPONES.find((c) => c.codigo === 'ALBORADA10')!;
    const subtotal = 500000;
    const descuento = Math.round(subtotal * (cupon.valor / 100));
    expect(descuento).toBe(50000);
    expect(subtotal - descuento).toBe(450000);
  });

  it('exige el mínimo de noches requerido para el cupón BIENVENIDA20', () => {
    const cupon = INITIAL_CUPONES.find((c) => c.codigo === 'BIENVENIDA20')!;
    expect(cupon.minimo_noches).toBe(2);

    // Caso 1 noche: debe fallar condición
    const nochesInsuficientes = 1;
    const esValido1 = !cupon.minimo_noches || nochesInsuficientes >= cupon.minimo_noches;
    expect(esValido1).toBe(false);

    // Caso 3 noches: debe cumplir condición
    const nochesSuficientes = 3;
    const esValido2 = !cupon.minimo_noches || nochesSuficientes >= cupon.minimo_noches;
    expect(esValido2).toBe(true);
  });

  it('aplica correctamente el cupón de monto fijo ESCAPADA50K ($50.000 COP)', () => {
    const cupon = INITIAL_CUPONES.find((c) => c.codigo === 'ESCAPADA50K')!;
    expect(cupon.tipo).toBe('MONTO_FIJO');
    expect(cupon.valor).toBe(50000);

    const subtotal = 380000;
    const descuento = Math.min(subtotal, cupon.valor);
    expect(descuento).toBe(50000);
    expect(subtotal - descuento).toBe(330000);
  });
});

describe('Fase 3: Sistema de Calificaciones y Reseñas', () => {
  it('contiene reseñas iniciales de huéspedes verificados', () => {
    expect(INITIAL_RESENAS.length).toBeGreaterThanOrEqual(4);
    const primera = INITIAL_RESENAS[0];
    expect(primera).toHaveProperty('id_habitacion');
    expect(primera).toHaveProperty('cliente_nombre');
    expect(primera).toHaveProperty('calificacion');
    expect(primera.calificacion).toBeGreaterThanOrEqual(1);
    expect(primera.calificacion).toBeLessThanOrEqual(5);
  });

  it('calcula correctamente el promedio de calificación y conteo de reseñas', () => {
    const resenasHab1: Resena[] = [
      {
        id_resena: 1,
        id_habitacion: 1,
        cliente_nombre: 'Carolina M.',
        calificacion: 5,
        comentario: 'Excelente',
        fecha: '2026-11-01',
      },
      {
        id_resena: 2,
        id_habitacion: 1,
        cliente_nombre: 'Andrés P.',
        calificacion: 4,
        comentario: 'Muy agradable',
        fecha: '2026-11-03',
      },
    ];

    const sum = resenasHab1.reduce((acc, r) => acc + r.calificacion, 0);
    const promedio = Number((sum / resenasHab1.length).toFixed(1));
    expect(promedio).toBe(4.5);
    expect(resenasHab1.length).toBe(2);
  });
});
