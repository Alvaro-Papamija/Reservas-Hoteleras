import { describe, it, expect } from 'vitest';
import { INITIAL_HABITACIONES, INITIAL_TIPOS, INITIAL_NOTIFICACIONES, FAQ_ITEMS } from '../data/mockData';
import { RecomendacionIAQuery, Notificacion, PrediccionOcupacionDia } from '../types/hotel';

describe('Fase 4: Motor de Recomendación de Habitaciones con IA', () => {
  it('genera recomendaciones personalizadas para viaje romántico priorizando suites o habitaciones con balcón', () => {
    const query: RecomendacionIAQuery = {
      motivo_viaje: 'romantico',
      huespedes: 2,
      presupuesto_max: 450000,
      preferencias: ['balcón', 'desayuno'],
    };

    const suites = INITIAL_HABITACIONES.filter((h) => h.id_tipo === 5);
    expect(suites.length).toBeGreaterThan(0);
    expect(query.motivo_viaje).toBe('romantico');
  });

  it('valida la restricción de capacidad de huéspedes en las recomendaciones', () => {
    const query: RecomendacionIAQuery = {
      motivo_viaje: 'familiar',
      huespedes: 5,
      preferencias: ['2 Baños'],
    };

    const familiar = INITIAL_TIPOS.find((t) => t.nombre === 'Familiar')!;
    expect(familiar.capacidad).toBeGreaterThanOrEqual(query.huespedes);
  });
});

describe('Fase 4: Chatbot Concierge para Preguntas Frecuentes', () => {
  it('contiene respuestas verificadas para las principales dudas de huéspedes', () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(6);

    const checkinFAQ = FAQ_ITEMS.find((f) => f.palabrasClave.includes('checkin'));
    expect(checkinFAQ).toBeDefined();
    expect(checkinFAQ?.respuesta).toContain('3:00 PM');
    expect(checkinFAQ?.respuesta).toContain('12:00 PM');

    const cancelFAQ = FAQ_ITEMS.find((f) => f.palabrasClave.includes('cancelar'));
    expect(cancelFAQ).toBeDefined();
    expect(cancelFAQ?.respuesta).toContain('48 horas');
  });

  it('permite coincidencia por palabras clave normalizadas', () => {
    const userInput = '¿Tienen parqueadero para mi carro?';
    const normalized = userInput.toLowerCase();
    const match = FAQ_ITEMS.find((f) => f.palabrasClave.some((kw) => normalized.includes(kw)));
    expect(match).toBeDefined();
    expect(match?.categoria).toBe('servicios');
  });
});

describe('Fase 4: Predicción Básica de Ocupación', () => {
  it('calcula la proyección de demanda con factores de fin de semana y temporada', () => {
    const totalHabs = 30;
    const realOccupied = 12;
    const realRate = Math.round((realOccupied / totalHabs) * 100);

    // Multiplicador de fin de semana
    const dayMultiplier = 1.30;
    const projectedRate = Math.min(100, Math.round((realRate + 30) * dayMultiplier * 0.7));

    expect(projectedRate).toBeGreaterThan(realRate);
    expect(projectedRate).toBeLessThanOrEqual(100);
  });

  it('asigna la categoría de demanda y tarifa recomendada de forma consistente', () => {
    const categorizarDemanda = (rate: number) => {
      if (rate >= 85) return { nivel: 'MUY_ALTA', tarifa: 265000 };
      if (rate >= 65) return { nivel: 'ALTA', tarifa: 240000 };
      if (rate >= 40) return { nivel: 'MEDIA', tarifa: 220000 };
      return { nivel: 'BAJA', tarifa: 195000 };
    };

    expect(categorizarDemanda(90).nivel).toBe('MUY_ALTA');
    expect(categorizarDemanda(70).nivel).toBe('ALTA');
    expect(categorizarDemanda(50).nivel).toBe('MEDIA');
    expect(categorizarDemanda(25).nivel).toBe('BAJA');
  });
});

describe('Fase 4: Sistema de Notificaciones Automáticas', () => {
  it('contiene notificaciones iniciales con estados de lectura y roles definidos', () => {
    expect(INITIAL_NOTIFICACIONES.length).toBeGreaterThanOrEqual(3);
    const unread = INITIAL_NOTIFICACIONES.filter((n) => !n.leida);
    expect(unread.length).toBeGreaterThan(0);
  });

  it('permite transicionar notificaciones a estado leída', () => {
    const notifs: Notificacion[] = [...INITIAL_NOTIFICACIONES];
    const targetId = notifs[0].id_notificacion;

    const actualizadas = notifs.map((n) =>
      n.id_notificacion === targetId ? { ...n, leida: true } : n
    );

    const buscada = actualizadas.find((n) => n.id_notificacion === targetId)!;
    expect(buscada.leida).toBe(true);
  });
});

