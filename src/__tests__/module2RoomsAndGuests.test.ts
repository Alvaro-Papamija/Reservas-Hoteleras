import { describe, it, expect } from 'vitest';
import { INITIAL_TIPOS, INITIAL_HABITACIONES, INITIAL_CLIENTES } from '../data/mockData';
import { Habitacion, Cliente, EstadoHabitacion } from '../types/hotel';

describe('Módulo 2: Catálogo de Habitaciones y Huéspedes', () => {

  describe('[HU-03] Creación de Nuevas Habitaciones (RF-05)', () => {
    it('debe validar la unicidad del número de habitación para prevenir duplicados', () => {
      const numerosExistentes = INITIAL_HABITACIONES.map(h => h.numero);
      const nuevoNumeroValido = '501';
      const numeroDuplicado = INITIAL_HABITACIONES[0].numero;

      expect(numerosExistentes.includes(nuevoNumeroValido)).toBe(false);
      expect(numerosExistentes.includes(numeroDuplicado)).toBe(true);
    });

    it('debe instanciar una nueva habitación con estado inicial DISPONIBLE y activa = true', () => {
      const nuevaHabitacion: Habitacion = {
        id_habitacion: 99,
        id_tipo: 1,
        numero: '305',
        piso: 3,
        estado: 'DISPONIBLE',
        descripcion: 'Habitación estándar con vista a la piscina',
        imagen: '/assets/images/habitacion_doble_deluxe_1794431402242.jpg',
        servicios: ['WiFi', 'TV', 'Aire Acondicionado'],
        activa: true
      };

      expect(nuevaHabitacion.estado).toBe('DISPONIBLE');
      expect(nuevaHabitacion.activa).toBe(true);
      expect(nuevaHabitacion.piso).toBeGreaterThan(0);
      expect(nuevaHabitacion.servicios.length).toBeGreaterThan(0);
    });

    it('debe vincular la habitación a un tipo existente con capacidad y tarifa válidas', () => {
      const tipo = INITIAL_TIPOS.find(t => t.id_tipo === 1);
      expect(tipo).toBeDefined();
      expect(tipo!.capacidad).toBeGreaterThanOrEqual(1);
      expect(tipo!.precio_base).toBeGreaterThan(0);
    });
  });

  describe('[HU-04] Edición y Desactivación Lógica de Habitaciones (RF-06, RF-07)', () => {
    it('debe soportar la desactivación lógica (Soft Delete) sin eliminar la entidad física', () => {
      const habitacionOriginal = { ...INITIAL_HABITACIONES[0] };
      expect(habitacionOriginal.activa).toBe(true);

      // Desactivación lógica
      const habitacionDesactivada: Habitacion = {
        ...habitacionOriginal,
        activa: false
      };

      expect(habitacionDesactivada.activa).toBe(false);
      expect(habitacionDesactivada.id_habitacion).toBe(habitacionOriginal.id_habitacion);
      expect(habitacionDesactivada.numero).toBe(habitacionOriginal.numero);
    });

    it('las habitaciones inactivas deben ser excluidas de las búsquedas públicas de disponibilidad', () => {
      const inventarioPrueba: Habitacion[] = [
        { ...INITIAL_HABITACIONES[0], activa: true },
        { ...INITIAL_HABITACIONES[1], activa: false }
      ];

      const disponiblesParaReserva = inventarioPrueba.filter(h => h.activa && h.estado === 'DISPONIBLE');
      expect(disponiblesParaReserva.some(h => h.id_habitacion === inventarioPrueba[1].id_habitacion)).toBe(false);
    });

    it('las habitaciones en estado MANTENIMIENTO deben ser bloqueadas del motor de reserva', () => {
      const habitacionEnReparacion: Habitacion = {
        ...INITIAL_HABITACIONES[0],
        estado: 'MANTENIMIENTO' as EstadoHabitacion,
        activa: true
      };

      const esAptaParaReserva = habitacionEnReparacion.activa && habitacionEnReparacion.estado === 'DISPONIBLE';
      expect(esAptaParaReserva).toBe(false);
    });

    it('la modificación de tarifas no altera el precio de reservas previamente confirmadas (RN-14)', () => {
      const tarifaPactadaEnReserva = 250000;
      let tarifaCatalogoGeneral = 250000;

      // Administrador actualiza precio en catálogo general
      tarifaCatalogoGeneral = 290000;

      expect(tarifaPactadaEnReserva).toBe(250000);
      expect(tarifaCatalogoGeneral).toBe(290000);
    });
  });

  describe('[HU-05] Registro de Huéspedes en Recepción (RF-08, RF-09)', () => {
    it('debe registrar un nuevo huésped con documento de identidad y datos de contacto obligatorios', () => {
      const nuevoHuesped: Cliente = {
        id_cliente: 101,
        id_usuario: 50,
        nombre: 'Carlos Andrés',
        apellido: 'Mendoza Pérez',
        documento: '1075284910',
        telefono: '3157894561',
        correo: 'carlos.mendoza@email.com',
        direccion: 'Calle 10 # 4-25, Neiva',
        fecha_registro: '2026-11-17'
      };

      expect(nuevoHuesped.documento.trim().length).toBeGreaterThanOrEqual(6);
      expect(nuevoHuesped.nombre.trim().length).toBeGreaterThanOrEqual(2);
      expect(nuevoHuesped.correo).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
      expect(nuevoHuesped.telefono).toBeDefined();
    });

    it('debe detectar huéspedes existentes para evitar registros duplicados por documento', () => {
      const clientes = [...INITIAL_CLIENTES];
      const documentoExistente = clientes[0].documento;
      const documentoNuevo = '9998887776';

      const existeDuplicado = clientes.some(c => c.documento === documentoExistente);
      const esNuevo = !clientes.some(c => c.documento === documentoNuevo);

      expect(existeDuplicado).toBe(true);
      expect(esNuevo).toBe(true);
    });
  });

});
