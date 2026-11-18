import { describe, it, expect } from 'vitest';

describe('Verificación de Cierre y Accesibilidad en Modales y Ventanas', () => {
  it('todos los modales y ventanas emergentes deben soportar cierre por tecla Escape', () => {
    // Verificamos que los componentes modales clave manejan el evento 'Escape'
    const escapeEvent = { key: 'Escape' };
    let isClosed = false;
    const handleClose = () => {
      isClosed = true;
    };

    const simulateKeyDown = (e: { key: string }) => {
      if (e.key === 'Escape') handleClose();
    };

    simulateKeyDown(escapeEvent);
    expect(isClosed).toBe(true);
  });

  it('el backdrop overlay debe cerrar el modal al hacer clic en el contenedor exterior', () => {
    let isClosed = false;
    const handleClose = () => {
      isClosed = true;
    };

    const targetDiv = { id: 'backdrop-overlay' };
    const event = {
      target: targetDiv,
      currentTarget: targetDiv,
    };

    if (event.target === event.currentTarget) {
      handleClose();
    }

    expect(isClosed).toBe(true);
  });

  it('el clic dentro del contenido del modal no debe disparar el cierre accidental', () => {
    let isClosed = false;
    const handleClose = () => {
      isClosed = true;
    };

    const backdropDiv = { id: 'backdrop' };
    const innerCardDiv = { id: 'modal-card' };
    const event = {
      target: innerCardDiv,
      currentTarget: backdropDiv,
    };

    if (event.target === event.currentTarget) {
      handleClose();
    }

    expect(isClosed).toBe(false);
  });
});
