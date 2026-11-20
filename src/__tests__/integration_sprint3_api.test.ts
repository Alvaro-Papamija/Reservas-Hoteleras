import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateEmail,
  validateColombianPhone,
  validateDocumento,
  validateLuhnCard,
  validateCardExpiry,
  validateCardCVV,
  validateReservationDates,
  validateGuestCapacity,
  validatePaymentAmount,
} from '../utils/validators';
import { hotelApi } from '../services/hotelApiService';

describe('Sprint 3: Pruebas de Integración y Validaciones de Producción', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ========================================================
  // 1. MÓDULO DE VALIDACIONES DE FORMULARIO Y NEGOCIO
  // ========================================================
  describe('1. Validaciones de Datos de Huésped y Contacto (Ley 1581)', () => {
    it('debe validar correos electrónicos válidos e invalidar formatos erróneos o maliciosos', () => {
      // Válidos
      expect(validateEmail('huesped@hotelalborada.com.co').valid).toBe(true);
      expect(validateEmail('maria.gonzalez+reserva@gmail.com').valid).toBe(true);
      expect(validateEmail('alvaro.papamija@soy.sena.edu.co').valid).toBe(true);

      // Inválidos
      expect(validateEmail('').valid).toBe(false);
      expect(validateEmail('sin_arroba.com').valid).toBe(false);
      expect(validateEmail('invalido@').valid).toBe(false);
      expect(validateEmail('invalido@dominio').valid).toBe(false);
      expect(validateEmail('espacio en@correo.com').valid).toBe(false);
    });

    it('debe validar números de teléfono celular colombianos (10 dígitos o formato E.164 +57)', () => {
      // Celulares colombianos válidos
      expect(validateColombianPhone('3124589012').valid).toBe(true);
      expect(validateColombianPhone('300 123 4567').valid).toBe(true);
      expect(validateColombianPhone('+57 312 458 9012').valid).toBe(true);
      expect(validateColombianPhone('+573001234567').valid).toBe(true);

      // Inválidos
      expect(validateColombianPhone('').valid).toBe(false);
      expect(validateColombianPhone('12345').valid).toBe(false);
      expect(validateColombianPhone('2123456789').valid).toBe(false); // No empieza por 3
      expect(validateColombianPhone('+57 212 345 6789').valid).toBe(false); // Celular +57 no empieza por 3
    });

    it('debe validar documentos de identidad según normativa colombiana (CC, CE, Pasaporte, NIT)', () => {
      // Cédula de Ciudadanía (6 a 10 dígitos)
      expect(validateDocumento('1085294821', 'CC').valid).toBe(true);
      expect(validateDocumento('19458291', 'CC').valid).toBe(true);
      expect(validateDocumento('123', 'CC').valid).toBe(false); // Menos de 6 dígitos
      expect(validateDocumento('1085294821000', 'CC').valid).toBe(false); // Más de 10 dígitos

      // Pasaporte
      expect(validateDocumento('PA123456', 'PAS').valid).toBe(true);
      expect(validateDocumento('12', 'PAS').valid).toBe(false);

      // Cédula de Extranjería
      expect(validateDocumento('987654', 'CE').valid).toBe(true);
    });
  });

  describe('2. Validaciones de Fechas y Capacidad de Alojamiento', () => {
    it('debe calcular las noches y validar que la salida sea posterior a la entrada', () => {
      const ok = validateReservationDates('2026-12-15', '2026-12-18');
      expect(ok.valid).toBe(true);
      expect(ok.noches).toBe(3);

      // Mismo día (0 noches) -> inválido
      const sameDay = validateReservationDates('2026-12-15', '2026-12-15');
      expect(sameDay.valid).toBe(false);

      // Salida anterior a entrada -> inválido
      const inverted = validateReservationDates('2026-12-20', '2026-12-15');
      expect(inverted.valid).toBe(false);

      // Estancia mayor a 30 noches -> requiere consulta especial
      const tooLong = validateReservationDates('2026-12-01', '2027-01-15');
      expect(tooLong.valid).toBe(false);
    });

    it('debe rechazar huéspedes cuando superan la capacidad máxima de la suite', () => {
      expect(validateGuestCapacity(2, 4).valid).toBe(true);
      expect(validateGuestCapacity(4, 4).valid).toBe(true);
      expect(validateGuestCapacity(5, 4).valid).toBe(false);
      expect(validateGuestCapacity(0, 4).valid).toBe(false);
    });
  });

  // ========================================================
  // 2. VALIDACIONES DE SEGURIDAD FINANCIERA (PASARELA DE PAGO)
  // ========================================================
  describe('3. Seguridad de Pasarela de Pagos & Algoritmo de Luhn', () => {
    it('debe validar tarjetas válidas con algoritmo de Luhn y detectar su franquicia', () => {
      // Tarjeta de prueba Visa válida (Luhn checksum correcto)
      const visaValida = '4532015112830366';
      const resVisa = validateLuhnCard(visaValida);
      expect(resVisa.valid).toBe(true);
      expect(resVisa.cardBrand).toBe('Visa');

      // Tarjeta con número alterado que falla Luhn
      const tarjetaInvalida = '4532015112830367';
      const resInvalida = validateLuhnCard(tarjetaInvalida);
      expect(resInvalida.valid).toBe(false);
      expect(resInvalida.error).toContain('Luhn');

      // Tarjeta vacía
      expect(validateLuhnCard('').valid).toBe(false);
    });

    it('debe validar fechas de vencimiento de tarjetas rechazando plásticos vencidos', () => {
      // Futuro válido (año 2030)
      expect(validateCardExpiry('12/30').valid).toBe(true);
      expect(validateCardExpiry('06/29').valid).toBe(true);

      // Pasado vencido (ej: año 2020)
      expect(validateCardExpiry('01/20').valid).toBe(false);

      // Mes inválido (mes 13)
      expect(validateCardExpiry('13/28').valid).toBe(false);

      // Formato incorrecto
      expect(validateCardExpiry('abc').valid).toBe(false);
    });

    it('debe validar código de seguridad CVV según la franquicia', () => {
      // Visa / Mastercard (3 dígitos)
      expect(validateCardCVV('123', 'Visa').valid).toBe(true);
      expect(validateCardCVV('12', 'Visa').valid).toBe(false);
      expect(validateCardCVV('1234', 'Visa').valid).toBe(false);

      // American Express (4 dígitos)
      expect(validateCardCVV('1234', 'American Express').valid).toBe(true);
      expect(validateCardCVV('123', 'American Express').valid).toBe(false);
    });

    it('debe validar que los montos a liquidar sean positivos y no excedan el saldo pendiente', () => {
      expect(validatePaymentAmount(150000, 300000).valid).toBe(true);
      expect(validatePaymentAmount(300000, 300000).valid).toBe(true);
      expect(validatePaymentAmount(0, 300000).valid).toBe(false);
      expect(validatePaymentAmount(-50000, 300000).valid).toBe(false);
      expect(validatePaymentAmount(400000, 300000).valid).toBe(false);
    });
  });

  // ========================================================
  // 3. INTEGRACIÓN CON EL SERVICIO API REST (CLIENTE HTTP)
  // ========================================================
  describe('4. Cliente API REST Integrado (hotelApiService)', () => {
    it('debe construir y serializar solicitudes POST /api/reservas con DTOs válidos', async () => {
      const mockResponse = {
        idReserva: 101,
        codigo: 'RH-20261215-9988',
        idCliente: 1,
        clienteNombre: 'Laura Gómez',
        clienteDocumento: '1085294821',
        clienteCorreo: 'laura.gomez@ejemplo.com',
        idHabitacion: 1,
        habitacionNumero: '101',
        habitacionTipo: 'Suite',
        fechaEntrada: '2026-12-15',
        fechaSalida: '2026-12-18',
        cantidadHuespedes: 2,
        precioNoche: 250000,
        cantidadNoches: 3,
        subtotal: 750000,
        descuento: 0,
        total: 750000,
        saldo: 750000,
        estado: 'PENDIENTE',
        fechaCreacion: '2026-11-20T14:00:00Z',
      };

      // Mock de fetch nativo
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const requestPayload = {
        idHabitacion: 1,
        idCliente: 1,
        fechaEntrada: '2026-12-15',
        fechaSalida: '2026-12-18',
        cantidadHuespedes: 2,
        cuponCodigo: 'ALBORADA10',
      };

      const resultado = await hotelApi.crearReserva(requestPayload);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain('/api/reservas');
      expect(options?.method).toBe('POST');
      expect(JSON.parse(options?.body as string)).toEqual(requestPayload);
      expect(resultado.idReserva).toBe(101);
      expect(resultado.codigo).toBe('RH-20261215-9988');
    });

    it('debe registrar pagos a través de POST /api/pagos y retornar el recibo de caja oficial', async () => {
      const mockPagoResponse = {
        idPago: 42,
        idReserva: 101,
        monto: 750000,
        metodo: 'TARJETA',
        fecha: '2026-11-20T14:05:00Z',
        reciboCaja: 'RC-20261120-4422',
        referencia: 'APROB-998811',
        registradoPor: 'Huésped Online',
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockPagoResponse,
      } as Response);

      const pagoPayload = {
        idReserva: 101,
        monto: 750000,
        metodo: 'TARJETA' as const,
        referencia: 'APROB-998811',
      };

      const resultado = await hotelApi.registrarPago(pagoPayload);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];
      expect(url).toContain('/api/pagos');
      expect(options?.method).toBe('POST');
      expect(resultado.reciboCaja).toBe('RC-20261120-4422');
      expect(resultado.monto).toBe(750000);
    });

    it('debe consultar disponibilidad de habitaciones con parámetros de fecha en GET /api/habitaciones/disponibles', async () => {
      const mockHabitaciones = [
        {
          idHabitacion: 1,
          idTipo: 5,
          tipoNombre: 'Suite',
          numero: '101',
          piso: 1,
          precioBase: 250000,
          capacidad: 2,
          descripcion: 'Suite con vista a la piscina',
          imagen: 'https://images.unsplash.com/suite.jpg',
          estado: 'DISPONIBLE',
          activa: true,
        },
      ];

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHabitaciones,
      } as Response);

      const disponibles = await hotelApi.getHabitacionesDisponibles('2026-12-15', '2026-12-18', 2);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url] = fetchSpy.mock.calls[0];
      expect(url).toContain('/api/habitaciones/disponibles');
      expect(url).toContain('fechaEntrada=2026-12-15');
      expect(url).toContain('fechaSalida=2026-12-18');
      expect(url).toContain('capacidad=2');
      expect(disponibles.length).toBe(1);
      expect(disponibles[0].numero).toBe('101');
    });

    it('debe manejar errores de red y responder con excepciones claras', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({
          mensaje: 'Conflicto de reserva: La suite ya se encuentra reservada en el rango seleccionado.',
        }),
      } as Response);

      await expect(
        hotelApi.crearReserva({
          idHabitacion: 1,
          idCliente: 1,
          fechaEntrada: '2026-12-15',
          fechaSalida: '2026-12-18',
          cantidadHuespedes: 2,
        })
      ).rejects.toThrow('Conflicto de reserva');
    });

    it('debe diagnosticar la salud del backend mediante checkHealth()', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'OK', app: 'Hotel Alborada Backend', version: '1.0.0' }),
      } as Response);

      const isHealthy = await hotelApi.checkHealth();
      expect(isHealthy).toBe(true);

      // Cuando el backend está caído (rechazo de red)
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));
      const isDown = await hotelApi.checkHealth();
      expect(isDown).toBe(false);
    });
  });
});
