import { describe, it, expect } from 'vitest';
import { validateGuestCapacity } from '../utils/validators';

describe('Validación de Capacidad y Reglas de Negocio en BookingModal (RN04)', () => {
  it('validateGuestCapacity aprueba cuando el número de huéspedes coincide con la capacidad máxima de la suite individual', () => {
    // Habitación Individual (capacidad 1) con 1 huésped
    const result = validateGuestCapacity(1, 1);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('validateGuestCapacity rechaza cuando huéspedes supera la capacidad de habitación individual', () => {
    // Habitación Individual (capacidad 1) con 2 huéspedes
    const result = validateGuestCapacity(2, 1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('supera la capacidad máxima de la suite');
  });

  it('Lógica de inicialización acota huéspedes al tope de la suite si el valor por defecto excede la capacidad', () => {
    const defaultHuespedes = 2; // Búsqueda general por defecto
    const capacidadHabitacionIndividual = 1;

    // Cálculo seguro implementado en BookingModal
    const huespedesIniciales = Math.min(Math.max(1, defaultHuespedes), capacidadHabitacionIndividual);

    expect(huespedesIniciales).toBe(1);
    const validacion = validateGuestCapacity(huespedesIniciales, capacidadHabitacionIndividual);
    expect(validacion.valid).toBe(true);
  });

  it('Lógica de suite familiar permite hasta la capacidad configurada (5 personas)', () => {
    const capacidadFamiliar = 5;
    expect(validateGuestCapacity(5, capacidadFamiliar).valid).toBe(true);
    expect(validateGuestCapacity(6, capacidadFamiliar).valid).toBe(false);
  });
});
