import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Habitacion,
  TipoHabitacion,
  Cliente,
  Usuario,
  Reserva,
  RolUsuario,
  EstadoReserva,
  EstadoHabitacion,
  DisponibilidadQuery,
  Cupon,
  Resena,
} from '../types/hotel';
import {
  INITIAL_HABITACIONES,
  INITIAL_TIPOS,
  INITIAL_CLIENTES,
  INITIAL_USUARIOS,
  INITIAL_RESERVAS,
  INITIAL_CUPONES,
  INITIAL_RESENAS,
} from '../data/mockData';

interface BookingValidationResult {
  valid: boolean;
  message?: string;
  field?: string;
}

interface HotelContextType {
  // State
  habitaciones: Habitacion[];
  tipos: TipoHabitacion[];
  clientes: Cliente[];
  reservas: Reserva[];
  cupones: Cupon[];
  resenas: Resena[];
  currentRole: RolUsuario;
  currentUser: Usuario;
  currentCliente: Cliente | null;
  activeView: 'inicio' | 'habitaciones' | 'disponibilidad' | 'mis-reservas' | 'admin-dashboard' | 'admin-habitaciones' | 'admin-reservas' | 'admin-clientes' | 'admin-reportes' | 'admin-calendario';
  
  // Actions
  setActiveView: (view: any) => void;
  switchRole: (role: RolUsuario) => void;
  loginAs: (email: string) => boolean;
  logout: () => void;
  
  // Business logic
  checkOverlap: (idHabitacion: number, fechaEntrada: string, fechaSalida: string, excludeReservaId?: number) => boolean;
  calculateNights: (fechaEntrada: string, fechaSalida: string) => number;
  calculateTotal: (precioNoche: number, fechaEntrada: string, fechaSalida: string) => { noches: number; total: number };
  searchDisponibilidad: (query: DisponibilidadQuery) => Habitacion[];
  validarCupon: (codigo: string, subtotal: number, noches: number) => { valido: boolean; descuento: number; cupon?: Cupon; mensaje?: string };
  calificarReserva: (idReserva: number, calificacion: number, comentario: string) => { success: boolean; error?: string };
  getResenasHabitacion: (idHabitacion: number) => Resena[];
  getRatingHabitacion: (idHabitacion: number) => { promedio: number; total: number };
  
  // Reservations CRUD & State Machine
  createReserva: (data: {
    id_habitacion: number;
    fecha_entrada: string;
    fecha_salida: string;
    cantidad_huespedes: number;
    notas?: string;
    cupon_codigo?: string;
    cliente_override?: Partial<Cliente>;
  }) => { success: boolean; reserva?: Reserva; error?: string };
  
  cancelarReserva: (idReserva: number, isClientAction?: boolean) => { success: boolean; error?: string };
  cambiarEstadoReserva: (idReserva: number, nuevoEstado: EstadoReserva) => { success: boolean; error?: string };
  
  // Rooms CRUD
  addHabitacion: (hab: Omit<Habitacion, 'id_habitacion'>) => { success: boolean; error?: string };
  updateHabitacion: (hab: Habitacion) => { success: boolean; error?: string };
  cambiarEstadoHabitacion: (idHabitacion: number, nuevoEstado: EstadoHabitacion) => void;
  toggleHabitacionActiva: (idHabitacion: number) => { success: boolean; error?: string };
  
  // Types CRUD
  updateTipoHabitacion: (tipo: TipoHabitacion) => void;
  
  // System Reset
  resetToInitialData: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>(() => {
    const saved = localStorage.getItem('alborada_habitaciones');
    return saved ? JSON.parse(saved) : INITIAL_HABITACIONES;
  });

  const [tipos, setTipos] = useState<TipoHabitacion[]>(() => {
    const saved = localStorage.getItem('alborada_tipos');
    return saved ? JSON.parse(saved) : INITIAL_TIPOS;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('alborada_clientes');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [reservas, setReservas] = useState<Reserva[]>(() => {
    const saved = localStorage.getItem('alborada_reservas');
    return saved ? JSON.parse(saved) : INITIAL_RESERVAS;
  });

  const [cupones, setCupones] = useState<Cupon[]>(() => {
    const saved = localStorage.getItem('alborada_cupones');
    return saved ? JSON.parse(saved) : INITIAL_CUPONES;
  });

  const [resenas, setResenas] = useState<Resena[]>(() => {
    const saved = localStorage.getItem('alborada_resenas');
    return saved ? JSON.parse(saved) : INITIAL_RESENAS;
  });

  const [currentRole, setCurrentRole] = useState<RolUsuario>('CLIENTE');
  const [currentUser, setCurrentUser] = useState<Usuario>(INITIAL_USUARIOS[1]); // Default Laura Gómez (Cliente)
  const [activeView, setActiveView] = useState<any>('inicio');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('alborada_habitaciones', JSON.stringify(habitaciones));
  }, [habitaciones]);

  useEffect(() => {
    localStorage.setItem('alborada_tipos', JSON.stringify(tipos));
  }, [tipos]);

  useEffect(() => {
    localStorage.setItem('alborada_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('alborada_reservas', JSON.stringify(reservas));
  }, [reservas]);

  useEffect(() => {
    localStorage.setItem('alborada_cupones', JSON.stringify(cupones));
  }, [cupones]);

  useEffect(() => {
    localStorage.setItem('alborada_resenas', JSON.stringify(resenas));
  }, [resenas]);

  // Current client helper
  const currentCliente = clientes.find((c) => c.correo === currentUser.correo) || null;

  // Role switching
  const switchRole = (role: RolUsuario) => {
    setCurrentRole(role);
    if (role === 'ADMINISTRADOR') {
      setCurrentUser(INITIAL_USUARIOS[0]); // Alvaro Papamija
      if (activeView === 'inicio' || activeView === 'mis-reservas') {
        setActiveView('admin-dashboard');
      }
    } else {
      setCurrentUser(INITIAL_USUARIOS[1]); // Laura Gómez
      if (activeView.startsWith('admin-')) {
        setActiveView('inicio');
      }
    }
  };

  const loginAs = (email: string): boolean => {
    const user = INITIAL_USUARIOS.find((u) => u.correo.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setCurrentRole(user.rol);
      if (user.rol === 'ADMINISTRADOR') {
        setActiveView('admin-dashboard');
      } else {
        setActiveView('inicio');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    switchRole('CLIENTE');
    setActiveView('inicio');
  };

  // Business Logic: Dates & Nights
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

  // RN01: Guarantee against overlapping reservations
  // Checks active bookings (PENDIENTE or CONFIRMADA).
  // fecha_salida is exclusive: [entrada, salida)
  const checkOverlap = (
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

      // Overlap occurs if existing check-in < new check-out AND existing check-out > new check-in
      return rEntrada < nuevaSalida && rSalida > nuevaEntrada;
    });
  };

  // RN07 & HU04: Search available rooms
  const searchDisponibilidad = (query: DisponibilidadQuery): Habitacion[] => {
    const { fecha_entrada, fecha_salida, huespedes, id_tipo } = query;
    if (!fecha_entrada || !fecha_salida || huespedes <= 0) return [];

    return habitaciones.filter((hab) => {
      // Must be active
      if (!hab.activa) return false;

      // RN07: Mantenimiento rooms are not offered
      if (hab.estado === 'MANTENIMIENTO') return false;

      // Filter by type if specified
      if (id_tipo && hab.id_tipo !== id_tipo) return false;

      // Capacity check (RN04)
      const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
      if (!tipo || tipo.capacidad < huespedes) return false;

      // Overlap check (RN01)
      const hasConflict = checkOverlap(hab.id_habitacion, fecha_entrada, fecha_salida);
      return !hasConflict;
    });
  };

  // Coupons System
  const validarCupon = (codigo: string, subtotal: number, noches: number) => {
    if (!codigo || !codigo.trim()) {
      return { valido: false, descuento: 0, mensaje: 'Ingresa un código de cupón' };
    }
    const cleanCode = codigo.trim().toUpperCase();
    const cup = cupones.find((c) => c.codigo.toUpperCase() === cleanCode && c.activo);
    if (!cup) {
      return { valido: false, descuento: 0, mensaje: 'Cupón no válido o inactivo' };
    }
    if (cup.minimo_noches && noches < cup.minimo_noches) {
      return {
        valido: false,
        descuento: 0,
        mensaje: `Este cupón requiere una estancia mínima de ${cup.minimo_noches} noches`,
      };
    }
    let descuento = 0;
    if (cup.tipo === 'PORCENTAJE') {
      descuento = Math.round((subtotal * cup.valor) / 100);
    } else {
      descuento = Math.min(cup.valor, subtotal);
    }
    return {
      valido: true,
      descuento,
      cupon: cup,
      mensaje: `¡Cupón ${cup.codigo} aplicado! ${cup.descripcion}`,
    };
  };

  // Reviews and Ratings System
  const calificarReserva = (idReserva: number, calificacion: number, comentario: string) => {
    const target = reservas.find((r) => r.id_reserva === idReserva);
    if (!target) return { success: false, error: 'Reserva no encontrada.' };

    setReservas((prev) =>
      prev.map((r) =>
        r.id_reserva === idReserva
          ? { ...r, calificacion, comentario_calificacion: comentario }
          : r
      )
    );

    const nuevaResena: Resena = {
      id_resena: Date.now(),
      id_habitacion: target.id_habitacion,
      id_reserva: target.id_reserva,
      cliente_nombre: target.cliente_nombre,
      calificacion,
      comentario,
      fecha: new Date().toISOString().split('T')[0],
    };
    setResenas((prev) => [nuevaResena, ...prev]);

    return { success: true };
  };

  const getResenasHabitacion = (idHabitacion: number): Resena[] => {
    return resenas.filter((r) => r.id_habitacion === idHabitacion);
  };

  const getRatingHabitacion = (idHabitacion: number): { promedio: number; total: number } => {
    const habResenas = resenas.filter((r) => r.id_habitacion === idHabitacion);
    if (habResenas.length === 0) return { promedio: 4.9, total: 1 };
    const sum = habResenas.reduce((acc, curr) => acc + curr.calificacion, 0);
    const promedio = Number((sum / habResenas.length).toFixed(1));
    return { promedio, total: habResenas.length };
  };

  // HU05 & RN02: Create Reservation
  const createReserva = (data: {
    id_habitacion: number;
    fecha_entrada: string;
    fecha_salida: string;
    cantidad_huespedes: number;
    notas?: string;
    cupon_codigo?: string;
    cliente_override?: Partial<Cliente>;
  }): { success: boolean; reserva?: Reserva; error?: string } => {
    const { id_habitacion, fecha_entrada, fecha_salida, cantidad_huespedes, notas, cupon_codigo, cliente_override } = data;

    // Validation 1: Dates
    const start = new Date(fecha_entrada);
    const end = new Date(fecha_salida);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: 'Las fechas seleccionadas no tienen un formato válido.' };
    }

    if (end.getTime() <= start.getTime()) {
      return { success: false, error: 'La fecha de salida debe ser posterior a la fecha de entrada.' };
    }

    // Validation 2: Room exists and capacity
    const hab = habitaciones.find((h) => h.id_habitacion === id_habitacion);
    if (!hab) {
      return { success: false, error: 'La habitación seleccionada no existe.' };
    }

    if (hab.estado === 'MANTENIMIENTO' || !hab.activa) {
      return { success: false, error: 'La habitación se encuentra actualmente fuera de servicio.' };
    }

    const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
    if (!tipo) {
      return { success: false, error: 'Tipo de habitación no configurado.' };
    }

    if (cantidad_huespedes <= 0) {
      return { success: false, error: 'El número de huéspedes debe ser mayor a cero.' };
    }

    if (cantidad_huespedes > tipo.capacidad) {
      return {
        success: false,
        error: `El número de huéspedes (${cantidad_huespedes}) supera la capacidad máxima de esta habitación (${tipo.capacidad}).`,
      };
    }

    // Validation 3: Overlap collision (RN01)
    if (checkOverlap(id_habitacion, fecha_entrada, fecha_salida)) {
      return {
        success: false,
        error: 'La habitación ya no se encuentra disponible para las fechas seleccionadas (conflicto de reserva). Por favor elige otras fechas o habitación.',
      };
    }

    // Pricing calculation (RN02 & RN03)
    const { noches, total: subtotal } = calculateTotal(tipo.precio_base, fecha_entrada, fecha_salida);
    if (noches <= 0) {
      return { success: false, error: 'La estancia mínima es de 1 noche.' };
    }

    // Coupon discount calculation
    let descuento = 0;
    let cupon_aplicado: string | undefined = undefined;
    if (cupon_codigo) {
      const resCupon = validarCupon(cupon_codigo, subtotal, noches);
      if (resCupon.valido) {
        descuento = resCupon.descuento;
        cupon_aplicado = resCupon.cupon?.codigo;
      }
    }
    const totalFinal = Math.max(0, subtotal - descuento);

    // Generate unique readable code: RH-YYYYMMDD-XXXX
    const dateStr = fecha_entrada.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codigo = `RH-${dateStr}-${randomSuffix}`;

    // Target Client
    let targetCliente = currentCliente;
    if (cliente_override && (!targetCliente || currentRole === 'ADMINISTRADOR')) {
      const newId = Math.max(0, ...clientes.map((c) => c.id_cliente)) + 1;
      targetCliente = {
        id_cliente: newId,
        id_usuario: newId + 10,
        nombre: cliente_override.nombre || 'Huésped',
        apellido: cliente_override.apellido || '',
        documento: cliente_override.documento || `${Math.floor(10000000 + Math.random() * 90000000)}`,
        telefono: cliente_override.telefono || '+57 300 000 0000',
        direccion: cliente_override.direccion || 'Colombia',
        correo: cliente_override.correo || `huesped_${newId}@ejemplo.com`,
        fecha_registro: new Date().toISOString(),
      };
      setClientes((prev) => [...prev, targetCliente!]);
    }

    if (!targetCliente) {
      targetCliente = clientes[0];
    }

    const nuevaReserva: Reserva = {
      id_reserva: Date.now(),
      codigo,
      id_cliente: targetCliente.id_cliente,
      cliente_nombre: `${targetCliente.nombre} ${targetCliente.apellido}`.trim(),
      cliente_documento: targetCliente.documento,
      cliente_correo: targetCliente.correo,
      cliente_telefono: targetCliente.telefono,
      id_habitacion: hab.id_habitacion,
      habitacion_numero: hab.numero,
      habitacion_tipo: tipo.nombre,
      fecha_entrada,
      fecha_salida,
      cantidad_huespedes,
      precio_noche: tipo.precio_base,
      cantidad_noches: noches,
      subtotal,
      descuento,
      cupon_aplicado,
      total: totalFinal,
      estado: 'PENDIENTE',
      fecha_creacion: new Date().toISOString(),
      notas: notas || '',
    };

    setReservas((prev) => [nuevaReserva, ...prev]);

    return { success: true, reserva: nuevaReserva };
  };

  // RN05 & HU07: Cancel Reservation
  const cancelarReserva = (idReserva: number, isClientAction = true): { success: boolean; error?: string } => {
    const reserva = reservas.find((r) => r.id_reserva === idReserva);
    if (!reserva) {
      return { success: false, error: 'Reserva no encontrada.' };
    }

    if (reserva.estado === 'CANCELADA') {
      return { success: false, error: 'Esta reserva ya ha sido cancelada.' };
    }

    if (reserva.estado === 'FINALIZADA') {
      return { success: false, error: 'Una reserva finalizada no puede cancelarse.' };
    }

    // RN05: 48-hour policy for clients
    if (isClientAction && currentRole === 'CLIENTE') {
      const entradaDate = new Date(`${reserva.fecha_entrada}T15:00:00`);
      const now = new Date();
      const diffHours = (entradaDate.getTime() - now.getTime()) / (1000 * 3600);

      if (diffHours < 48) {
        return {
          success: false,
          error: `Las cancelaciones en línea solo están permitidas hasta 48 horas antes de la entrada (quedan ${Math.max(0, Math.round(diffHours))} horas). Para casos extraordinarios, por favor comunícate directamente con recepción.`,
        };
      }
    }

    setReservas((prev) =>
      prev.map((r) => (r.id_reserva === idReserva ? { ...r, estado: 'CANCELADA' } : r))
    );

    return { success: true };
  };

  // HU10: State Machine Transitions (Admin)
  const cambiarEstadoReserva = (idReserva: number, nuevoEstado: EstadoReserva): { success: boolean; error?: string } => {
    const reserva = reservas.find((r) => r.id_reserva === idReserva);
    if (!reserva) return { success: false, error: 'Reserva no encontrada.' };

    const actual = reserva.estado;

    // Allowed transitions:
    // PENDIENTE -> CONFIRMADA, CANCELADA
    // CONFIRMADA -> FINALIZADA, CANCELADA
    // CANCELADA / FINALIZADA -> No transitions allowed
    const validTransitions: Record<EstadoReserva, EstadoReserva[]> = {
      PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
      CONFIRMADA: ['FINALIZADA', 'CANCELADA'],
      CANCELADA: [],
      FINALIZADA: [],
    };

    if (!validTransitions[actual].includes(nuevoEstado)) {
      return {
        success: false,
        error: `Transición no permitida: No se puede cambiar de estado ${actual} a ${nuevoEstado}.`,
      };
    }

    setReservas((prev) =>
      prev.map((r) => (r.id_reserva === idReserva ? { ...r, estado: nuevoEstado } : r))
    );

    return { success: true };
  };

  // Room Management (Admin)
  const addHabitacion = (habData: Omit<Habitacion, 'id_habitacion'>): { success: boolean; error?: string } => {
    // Check unique number
    if (habitaciones.some((h) => h.numero.toLowerCase() === habData.numero.toLowerCase())) {
      return { success: false, error: `Ya existe una habitación registrada con el número ${habData.numero}.` };
    }

    const newId = Math.max(0, ...habitaciones.map((h) => h.id_habitacion)) + 1;
    const newHab: Habitacion = {
      ...habData,
      id_habitacion: newId,
    };

    setHabitaciones((prev) => [...prev, newHab]);
    return { success: true };
  };

  const updateHabitacion = (hab: Habitacion): { success: boolean; error?: string } => {
    if (habitaciones.some((h) => h.id_habitacion !== hab.id_habitacion && h.numero.toLowerCase() === hab.numero.toLowerCase())) {
      return { success: false, error: `El número ${hab.numero} ya está en uso por otra habitación.` };
    }

    setHabitaciones((prev) => prev.map((h) => (h.id_habitacion === hab.id_habitacion ? hab : h)));
    return { success: true };
  };

  const cambiarEstadoHabitacion = (idHabitacion: number, nuevoEstado: EstadoHabitacion) => {
    setHabitaciones((prev) =>
      prev.map((h) => (h.id_habitacion === idHabitacion ? { ...h, estado: nuevoEstado } : h))
    );
  };

  // HU08: Deactivate logically instead of deleting if future reservations exist
  const toggleHabitacionActiva = (idHabitacion: number): { success: boolean; error?: string } => {
    const hab = habitaciones.find((h) => h.id_habitacion === idHabitacion);
    if (!hab) return { success: false, error: 'Habitación no encontrada.' };

    if (hab.activa) {
      // Check for future active reservations
      const today = new Date().toISOString().split('T')[0];
      const hasFutureReservas = reservas.some(
        (r) =>
          r.id_habitacion === idHabitacion &&
          r.fecha_salida >= today &&
          (r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA')
      );

      if (hasFutureReservas) {
        return {
          success: false,
          error: 'Esta habitación tiene reservas activas programadas. No puede eliminarse, pero ha sido desactivada para no recibir nuevas reservas.',
        };
      }
    }

    setHabitaciones((prev) =>
      prev.map((h) => (h.id_habitacion === idHabitacion ? { ...h, activa: !h.activa } : h))
    );

    return { success: true };
  };

  const updateTipoHabitacion = (tipo: TipoHabitacion) => {
    setTipos((prev) => prev.map((t) => (t.id_tipo === tipo.id_tipo ? tipo : t)));
  };

  const resetToInitialData = () => {
    localStorage.removeItem('alborada_habitaciones');
    localStorage.removeItem('alborada_tipos');
    localStorage.removeItem('alborada_clientes');
    localStorage.removeItem('alborada_reservas');
    setHabitaciones(INITIAL_HABITACIONES);
    setTipos(INITIAL_TIPOS);
    setClientes(INITIAL_CLIENTES);
    setReservas(INITIAL_RESERVAS);
  };

  return (
    <HotelContext.Provider
      value={{
        habitaciones,
        tipos,
        clientes,
        reservas,
        cupones,
        resenas,
        currentRole,
        currentUser,
        currentCliente,
        activeView,
        setActiveView,
        switchRole,
        loginAs,
        logout,
        checkOverlap,
        calculateNights,
        calculateTotal,
        searchDisponibilidad,
        validarCupon,
        calificarReserva,
        getResenasHabitacion,
        getRatingHabitacion,
        createReserva,
        cancelarReserva,
        cambiarEstadoReserva,
        addHabitacion,
        updateHabitacion,
        cambiarEstadoHabitacion,
        toggleHabitacionActiva,
        updateTipoHabitacion,
        resetToInitialData,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel debe ser usado dentro de un HotelProvider');
  }
  return context;
};
