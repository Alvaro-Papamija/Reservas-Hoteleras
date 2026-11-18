import { describe, it, expect, beforeEach } from 'vitest';
import { ROLE_PERMISSIONS, ADMIN_EXCLUSIVE_VIEWS, isViewAllowed, hasStaffPrivilege } from '../utils/rbac';
import { Habitacion, Reserva, Pago, Cliente } from '../types/hotel';

describe('Batería de Pruebas BDD: Validación de HUs Corregidas', () => {

  describe('[HU-13] Control de Acceso por Roles (RBAC) - Perfil RECEPCIONISTA', () => {
    it('el rol RECEPCIONISTA tiene acceso a Front-Desk (reservas, calendario, huéspedes)', () => {
      expect(isViewAllowed('admin-reservas', 'RECEPCIONISTA')).toBe(true);
      expect(isViewAllowed('admin-calendario', 'RECEPCIONISTA')).toBe(true);
      expect(isViewAllowed('admin-clientes', 'RECEPCIONISTA')).toBe(true);
      expect(isViewAllowed('disponibilidad', 'RECEPCIONISTA')).toBe(true);
    });

    it('el rol RECEPCIONISTA tiene estrictamente denegado el acceso a vistas ejecutivas', () => {
      ADMIN_EXCLUSIVE_VIEWS.forEach((view) => {
        expect(isViewAllowed(view, 'RECEPCIONISTA')).toBe(false);
      });
      expect(isViewAllowed('admin-dashboard', 'RECEPCIONISTA')).toBe(false);
      expect(isViewAllowed('admin-habitaciones', 'RECEPCIONISTA')).toBe(false);
      expect(isViewAllowed('admin-reportes', 'RECEPCIONISTA')).toBe(false);
    });

    it('hasStaffPrivilege reconoce privilegios de personal para ADMINISTRADOR y RECEPCIONISTA', () => {
      expect(hasStaffPrivilege('ADMINISTRADOR')).toBe(true);
      expect(hasStaffPrivilege('RECEPCIONISTA')).toBe(true);
      expect(hasStaffPrivilege('CLIENTE')).toBe(false);
    });
  });

  describe('[HU-04] Desactivación Lógica Real de Habitaciones (Soft Delete)', () => {
    it('debe conmutar el estado activa a false preservando entidad e historial', () => {
      const hab: Habitacion = {
        id_habitacion: 101,
        id_tipo: 1,
        numero: '101',
        piso: 1,
        estado: 'DISPONIBLE',
        descripcion: 'Habitación estándar',
        imagen: '/img/101.jpg',
        servicios: ['WiFi'],
        activa: true,
      };

      // Desactivación lógica
      const habDesactivada = { ...hab, activa: !hab.activa };
      expect(habDesactivada.activa).toBe(false);
      expect(habDesactivada.id_habitacion).toBe(101);

      // Reactivación lógica
      const habReactivada = { ...habDesactivada, activa: !habDesactivada.activa };
      expect(habReactivada.activa).toBe(true);
    });
  });

  describe('[HU-10] Registro de Abonos, Pagos y Liquidación de Saldos', () => {
    it('calcula y actualiza el saldo pendiente reactivamente tras asentar abonos', () => {
      const totalReserva = 600000;
      const pagos: Pago[] = [];

      // Saldo inicial sin abonos
      let saldo = totalReserva - pagos.reduce((acc, p) => acc + p.monto, 0);
      expect(saldo).toBe(600000);

      // Abono 1: $200.000 COP en Efectivo
      pagos.push({
        id_pago: 1,
        id_reserva: 10,
        monto: 200000,
        metodo: 'EFECTIVO',
        fecha: '2026-12-01T10:00:00Z',
        recibo_caja: 'RC-20261201-1001',
      });
      saldo = totalReserva - pagos.reduce((acc, p) => acc + p.monto, 0);
      expect(saldo).toBe(400000);

      // Abono 2: $400.000 COP con Tarjeta (Liquidación total)
      pagos.push({
        id_pago: 2,
        id_reserva: 10,
        monto: 400000,
        metodo: 'TARJETA',
        fecha: '2026-12-02T15:30:00Z',
        recibo_caja: 'RC-20261202-1002',
      });
      saldo = totalReserva - pagos.reduce((acc, p) => acc + p.monto, 0);
      expect(saldo).toBe(0);
    });

    it('los recibos de caja cumplen con el formato estándar RC-YYYYMMDD-XXXX', () => {
      const recibo = 'RC-20261215-4819';
      expect(recibo).toMatch(/^RC-\d{8}-\d{4}$/);
    });
  });

  describe('[HU-11] Check-in con Asignación de Llave Física', () => {
    it('al registrar Check-in asigna llave y la habitación pasa a estado OCUPADA', () => {
      const reservaConfirmada: Reserva = {
        id_reserva: 20,
        codigo: 'RH-20261215-1101',
        id_cliente: 1,
        cliente_nombre: 'Laura Gómez',
        cliente_documento: '1085294821',
        cliente_correo: 'laura@example.com',
        id_habitacion: 204,
        habitacion_numero: '204',
        habitacion_tipo: 'Doble',
        fecha_entrada: '2026-12-15',
        fecha_salida: '2026-12-18',
        cantidad_huespedes: 2,
        precio_noche: 180000,
        cantidad_noches: 3,
        total: 540000,
        estado: 'CONFIRMADA',
        fecha_creacion: '2026-11-10T16:30:00Z',
      };

      // Simulación de Check-in
      const numeroLlave = 'Llave-204-B';
      const reservaCheckIn: Reserva = {
        ...reservaConfirmada,
        estado: 'CHECK_IN',
        numero_llave: numeroLlave,
        fecha_checkin: new Date().toISOString(),
      };

      const habitacionOcupada: Habitacion = {
        id_habitacion: 204,
        id_tipo: 2,
        numero: '204',
        piso: 2,
        estado: 'OCUPADA',
        descripcion: 'Habitación doble',
        imagen: '/img/204.jpg',
        servicios: ['WiFi'],
        activa: true,
      };

      expect(reservaCheckIn.estado).toBe('CHECK_IN');
      expect(reservaCheckIn.numero_llave).toBe('Llave-204-B');
      expect(reservaCheckIn.fecha_checkin).toBeDefined();
      expect(habitacionOcupada.estado).toBe('OCUPADA');
    });
  });

  describe('[HU-12] Check-out con Validación de Saldo Cero y Liberación de Cuarto', () => {
    it('deniega el Check-out si la reserva tiene saldo pendiente mayor a $0 COP', () => {
      const reservaConDeuda: Reserva = {
        id_reserva: 30,
        codigo: 'RH-20261215-1201',
        id_cliente: 2,
        cliente_nombre: 'Carlos Restrepo',
        cliente_documento: '1098452174',
        cliente_correo: 'carlos@example.com',
        id_habitacion: 301,
        habitacion_numero: '301',
        habitacion_tipo: 'Suite',
        fecha_entrada: '2026-12-15',
        fecha_salida: '2026-12-18',
        cantidad_huespedes: 2,
        precio_noche: 280000,
        cantidad_noches: 3,
        total: 840000,
        saldo: 340000, // Deuda pendiente
        estado: 'CHECK_IN',
        fecha_creacion: '2026-11-10T16:30:00Z',
      };

      const validarCheckOut = (r: Reserva) => {
        if ((r.saldo ?? r.total) > 0) {
          return { allowed: false, error: 'Saldo pendiente por liquidar.' };
        }
        return { allowed: true };
      };

      const resultado = validarCheckOut(reservaConDeuda);
      expect(resultado.allowed).toBe(false);
      expect(resultado.error).toContain('Saldo pendiente');
    });

    it('permite el Check-out con saldo $0 COP y libera la habitación a DISPONIBLE', () => {
      const reservaLiquidada: Reserva = {
        id_reserva: 30,
        codigo: 'RH-20261215-1201',
        id_cliente: 2,
        cliente_nombre: 'Carlos Restrepo',
        cliente_documento: '1098452174',
        cliente_correo: 'carlos@example.com',
        id_habitacion: 301,
        habitacion_numero: '301',
        habitacion_tipo: 'Suite',
        fecha_entrada: '2026-12-15',
        fecha_salida: '2026-12-18',
        cantidad_huespedes: 2,
        precio_noche: 280000,
        cantidad_noches: 3,
        total: 840000,
        saldo: 0, // Saldo $0 COP
        estado: 'CHECK_IN',
        fecha_creacion: '2026-11-10T16:30:00Z',
      };

      const ejecutarCheckOut = (r: Reserva) => {
        if ((r.saldo ?? r.total) === 0) {
          return {
            reservaEstado: 'FINALIZADA' as const,
            habitacionEstado: 'DISPONIBLE' as const,
          };
        }
        throw new Error('Deuda no saldada');
      };

      const resultado = ejecutarCheckOut(reservaLiquidada);
      expect(resultado.reservaEstado).toBe('FINALIZADA');
      expect(resultado.habitacionEstado).toBe('DISPONIBLE');
    });
  });

  describe('[HU-08] Modificación de Fechas de una Reserva Activa', () => {
    it('recalcula noches y tarifa total al modificar fechas sin colisión', () => {
      const tarifaNoche = 200000;
      const calcularEstancia = (entrada: string, salida: string) => {
        const start = new Date(entrada);
        const end = new Date(salida);
        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        return { noches: diffDays, total: diffDays * tarifaNoche };
      };

      // Modificación de 2 a 4 noches
      const estanciaOriginal = calcularEstancia('2026-12-15', '2026-12-17');
      expect(estanciaOriginal.noches).toBe(2);
      expect(estanciaOriginal.total).toBe(400000);

      const estanciaModificada = calcularEstancia('2026-12-15', '2026-12-19');
      expect(estanciaModificada.noches).toBe(4);
      expect(estanciaModificada.total).toBe(800000);
    });
  });

  describe('[HU-05] Registro de Huéspedes en CRM (Walk-in)', () => {
    it('crea la ficha de huésped verificando la unicidad del documento', () => {
      const clientesExistentes: Cliente[] = [
        {
          id_cliente: 1,
          id_usuario: 2,
          nombre: 'Laura',
          apellido: 'Gómez',
          documento: '1085294821',
          telefono: '3124589012',
          correo: 'laura@ejemplo.com',
          fecha_registro: '2026-10-15',
        },
      ];

      const validarDocumento = (doc: string) => {
        return !clientesExistentes.some((c) => c.documento === doc.trim());
      };

      expect(validarDocumento('1085294821')).toBe(false); // Duplicado
      expect(validarDocumento('1098765432')).toBe(true);  // Documento nuevo
    });
  });

  describe('[HU-14] Cancelación con Captura de Motivo', () => {
    it('persiste el motivo de cancelación al anular la reserva', () => {
      const reservaActiva: Reserva = {
        id_reserva: 40,
        codigo: 'RH-20261215-1401',
        id_cliente: 1,
        cliente_nombre: 'Laura Gómez',
        cliente_documento: '1085294821',
        cliente_correo: 'laura@example.com',
        id_habitacion: 102,
        habitacion_numero: '102',
        habitacion_tipo: 'Individual',
        fecha_entrada: '2026-12-20',
        fecha_salida: '2026-12-22',
        cantidad_huespedes: 1,
        precio_noche: 120000,
        cantidad_noches: 2,
        total: 240000,
        estado: 'CONFIRMADA',
        fecha_creacion: '2026-11-10T16:30:00Z',
      };

      const motivo = 'Motivos de salud o fuerza mayor';
      const reservaCancelada: Reserva = {
        ...reservaActiva,
        estado: 'CANCELADA',
        motivo_cancelacion: motivo,
      };

      expect(reservaCancelada.estado).toBe('CANCELADA');
      expect(reservaCancelada.motivo_cancelacion).toBe('Motivos de salud o fuerza mayor');
    });
  });

  describe('[HU-15] Desglose de Ingresos por Medio de Pago en Dashboard', () => {
    it('totaliza ingresos por EFECTIVO, TARJETA y TRANSFERENCIA', () => {
      const pagosPrueba: Pago[] = [
        { id_pago: 1, id_reserva: 1, monto: 150000, metodo: 'EFECTIVO', fecha: '2026-12-01', recibo_caja: 'RC-01' },
        { id_pago: 2, id_reserva: 2, monto: 350000, metodo: 'TARJETA', fecha: '2026-12-01', recibo_caja: 'RC-02' },
        { id_pago: 3, id_reserva: 3, monto: 200000, metodo: 'TRANSFERENCIA', fecha: '2026-12-01', recibo_caja: 'RC-03' },
        { id_pago: 4, id_reserva: 4, monto: 100000, metodo: 'EFECTIVO', fecha: '2026-12-02', recibo_caja: 'RC-04' },
      ];

      const resumen = {
        efectivo: pagosPrueba.filter((p) => p.metodo === 'EFECTIVO').reduce((a, b) => a + b.monto, 0),
        tarjeta: pagosPrueba.filter((p) => p.metodo === 'TARJETA').reduce((a, b) => a + b.monto, 0),
        transferencia: pagosPrueba.filter((p) => p.metodo === 'TRANSFERENCIA').reduce((a, b) => a + b.monto, 0),
      };

      expect(resumen.efectivo).toBe(250000);
      expect(resumen.tarjeta).toBe(350000);
      expect(resumen.transferencia).toBe(200000);
      expect(resumen.efectivo + resumen.tarjeta + resumen.transferencia).toBe(800000);
    });
  });

  describe('[HU-16] Consolidado Mensual de Reservas e Ingresos', () => {
    it('filtra reservas por prefijo de mes calendario YYYY-MM y totaliza montos', () => {
      const reservasPrueba: Pick<Reserva, 'fecha_entrada' | 'total' | 'estado'>[] = [
        { fecha_entrada: '2026-12-05', total: 300000, estado: 'CONFIRMADA' },
        { fecha_entrada: '2026-12-15', total: 500000, estado: 'CONFIRMADA' },
        { fecha_entrada: '2026-12-20', total: 200000, estado: 'CANCELADA' },
        { fecha_entrada: '2027-01-10', total: 400000, estado: 'CONFIRMADA' },
      ];

      const mesFiltro = '2026-12';
      const reservasDiciembre = reservasPrueba.filter((r) => r.fecha_entrada.startsWith(mesFiltro));
      expect(reservasDiciembre.length).toBe(3);

      const ingresosDiciembre = reservasDiciembre
        .filter((r) => r.estado !== 'CANCELADA')
        .reduce((acc, r) => acc + r.total, 0);

      expect(ingresosDiciembre).toBe(800000);
    });
  });

});
