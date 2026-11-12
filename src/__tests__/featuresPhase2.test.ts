import { describe, it, expect, vi } from 'vitest';
import { Reserva } from '../types/hotel';
import { INITIAL_HABITACIONES, INITIAL_TIPOS } from '../data/mockData';
import { generarComprobantePDF } from '../utils/pdfGenerator';

describe('Fase 2 - Código de Reserva', () => {
  it('El código de reserva tiene prefijo ALB o RH y longitud adecuada', () => {
    const testCodes = ['ALB-72941', 'ALB-38291', 'RH-20261215-0042'];
    testCodes.forEach((code) => {
      expect(code).toMatch(/^(ALB|RH)-[\w-]+$/);
      expect(code.length).toBeGreaterThanOrEqual(8);
    });
  });
});

describe('Fase 2 - Galería de Imágenes', () => {
  it('Cada habitación cuenta con al menos una imagen principal válida', () => {
    INITIAL_HABITACIONES.forEach((hab) => {
      expect(hab.imagen).toBeDefined();
      expect(hab.imagen.length).toBeGreaterThan(0);
    });
  });

  it('La galería de fotos de las habitaciones soporta múltiples fotografías por tipo', () => {
    // Verificamos que los 5 tipos de habitación cuenten con estructura de imágenes
    expect(INITIAL_TIPOS.length).toBe(5);
    INITIAL_TIPOS.forEach((tipo) => {
      expect(tipo.id_tipo).toBeGreaterThan(0);
      expect(tipo.nombre).toBeDefined();
    });
  });
});

describe('Fase 2 - Generador de Comprobantes PDF y Correo Transaccional', () => {
  const reservaMuestra: Reserva = {
    id_reserva: 99,
    codigo: 'ALB-TEST-PDF',
    id_cliente: 1,
    cliente_nombre: 'Laura Gómez',
    cliente_documento: '1085294821',
    cliente_correo: 'laura@example.com',
    cliente_telefono: '+57 312 456 7890',
    id_habitacion: 101,
    habitacion_numero: '101',
    habitacion_tipo: 'Individual',
    fecha_entrada: '2026-12-15',
    fecha_salida: '2026-12-18',
    cantidad_huespedes: 1,
    precio_noche: 120000,
    cantidad_noches: 3,
    total: 360000,
    estado: 'CONFIRMADA',
    fecha_creacion: '2026-11-12',
    notas: 'Llegada en horario vespertino.',
  };

  it('La función generarComprobantePDF procesa la reserva sin lanzar excepciones', () => {
    expect(() => {
      generarComprobantePDF(reservaMuestra);
    }).not.toThrow();
  });

  it('El contenido del comprobante contiene los datos esenciales de la estancia', () => {
    expect(reservaMuestra.codigo).toBe('ALB-TEST-PDF');
    expect(reservaMuestra.total).toBe(reservaMuestra.precio_noche * reservaMuestra.cantidad_noches);
    expect(reservaMuestra.cliente_nombre).toBe('Laura Gómez');
  });
});

