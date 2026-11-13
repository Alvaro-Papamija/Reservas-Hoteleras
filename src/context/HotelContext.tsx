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
  Notificacion,
  RecomendacionIAQuery,
  RecomendacionIAResult,
  MensajeChat,
  PrediccionOcupacionDia,
} from '../types/hotel';
import {
  INITIAL_HABITACIONES,
  INITIAL_TIPOS,
  INITIAL_CLIENTES,
  INITIAL_USUARIOS,
  INITIAL_RESERVAS,
  INITIAL_CUPONES,
  INITIAL_RESENAS,
  INITIAL_NOTIFICACIONES,
  FAQ_ITEMS,
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
  notificaciones: Notificacion[];
  currentRole: RolUsuario;
  currentUser: Usuario;
  isAuthenticated: boolean;
  currentCliente: Cliente | null;
  activeView: 'inicio' | 'habitaciones' | 'disponibilidad' | 'mis-reservas' | 'admin-dashboard' | 'admin-habitaciones' | 'admin-reservas' | 'admin-clientes' | 'admin-reportes' | 'admin-calendario';
  
  // Actions
  setActiveView: (view: any) => void;
  switchRole: (role: RolUsuario) => void;
  loginAs: (email: string) => boolean;
  logout: () => void;
  
  // Notifications actions
  marcarNotificacionLeida: (idNotificacion: string) => void;
  marcarTodasNotificacionesLeidas: () => void;
  agregarNotificacion: (notif: Omit<Notificacion, 'id_notificacion' | 'fecha' | 'leida'>) => void;

  // AI & Analytics features
  recomendarHabitacionesIA: (query: RecomendacionIAQuery) => RecomendacionIAResult[];
  consultarConciergeChat: (mensajeUsuario: string) => Promise<MensajeChat>;
  calcularPrediccionOcupacion: (diasFuturos?: number) => PrediccionOcupacionDia[];
  
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

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const saved = localStorage.getItem('alborada_notificaciones');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICACIONES;
  });

  const [currentRole, setCurrentRole] = useState<RolUsuario>(() => {
    const saved = localStorage.getItem('alborada_current_role');
    return (saved as RolUsuario) || 'CLIENTE';
  });

  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    const saved = localStorage.getItem('alborada_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS[1]; // Default Laura Gómez (Cliente)
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('alborada_is_auth');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeView, setActiveView] = useState<any>('inicio');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('alborada_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('alborada_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('alborada_is_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

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

  useEffect(() => {
    localStorage.setItem('alborada_notificaciones', JSON.stringify(notificaciones));
  }, [notificaciones]);

  // Current client helper
  const currentCliente = clientes.find((c) => c.correo === currentUser.correo) || null;

  // Role switching
  const switchRole = (role: RolUsuario) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
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
      setIsAuthenticated(true);
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
    setIsAuthenticated(false);
    setCurrentRole('CLIENTE');
    setCurrentUser({
      id_usuario: 0,
      nombre: 'Invitado',
      correo: '',
      rol: 'CLIENTE',
      estado: true,
    });
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

    // RBAC: Client can only rate their own reservations
    if (currentRole === 'CLIENTE' && target.cliente_correo.toLowerCase() !== currentUser.correo.toLowerCase()) {
      return { success: false, error: 'Acceso denegado: solo puedes calificar estancias asociadas a tu cuenta.' };
    }

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

  // Automated Notification Actions
  const marcarNotificacionLeida = (idNotificacion: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id_notificacion === idNotificacion ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasNotificacionesLeidas = () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const agregarNotificacion = (notif: Omit<Notificacion, 'id_notificacion' | 'fecha' | 'leida'>) => {
    const nueva: Notificacion = {
      ...notif,
      id_notificacion: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leida: false,
    };
    setNotificaciones((prev) => [nueva, ...prev]);
  };

  // Feature 1: AI Room Recommendation Engine
  const recomendarHabitacionesIA = (query: RecomendacionIAQuery): RecomendacionIAResult[] => {
    const { motivo_viaje, presupuesto_max, huespedes, preferencias } = query;
    const candidatas = habitaciones.filter((h) => h.activa && h.estado !== 'MANTENIMIENTO');

    const results: RecomendacionIAResult[] = candidatas.map((hab) => {
      const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
      if (!tipo) return null as any;

      let score = 65;
      const razones: string[] = [];

      // Capacity alignment
      if (huespedes <= tipo.capacidad) {
        score += 15;
        razones.push(`Capacidad idónea para ${huespedes} ${huespedes === 1 ? 'huésped' : 'huéspedes'}.`);
      } else {
        score -= 25;
      }

      // Motive alignment
      if (motivo_viaje === 'romantico') {
        if (tipo.nombre === 'Suite') {
          score += 20;
          razones.push('Suite de lujo con lencería premium y atmósfera íntima.');
        } else if (tipo.nombre === 'Doble') {
          score += 15;
          razones.push('Habitación doble cálida con acabados coloniales.');
        }
        if (hab.servicios.some((s) => s.toLowerCase().includes('balcón') || s.toLowerCase().includes('terraza'))) {
          score += 10;
          razones.push('Terraza o balcón privado para disfrutar el atardecer.');
        }
      } else if (motivo_viaje === 'negocios') {
        if (tipo.nombre === 'Individual' || tipo.nombre === 'Doble') {
          score += 20;
          razones.push('Escritorio ergonómico y ambiente silencioso de trabajo.');
        }
        if (hab.servicios.some((s) => s.toLowerCase().includes('wi-fi') || s.toLowerCase().includes('wifi'))) {
          score += 10;
          razones.push('Conexión Wi-Fi de 500 Mbps de alta estabilidad.');
        }
      } else if (motivo_viaje === 'familiar') {
        if (tipo.nombre === 'Familiar') {
          score += 25;
          razones.push('Suite espaciosa de dos ambientes adaptada para familias.');
        } else if (tipo.nombre === 'Triple') {
          score += 15;
          razones.push('Distribución cómoda con camas individuales independientes.');
        }
      } else if (motivo_viaje === 'relax') {
        if (hab.piso === 1 || tipo.nombre === 'Suite') {
          score += 15;
          razones.push('Ubicación privilegiada con acceso inmediato a jardines y solárium.');
        }
      }

      // Budget check
      if (presupuesto_max) {
        if (tipo.precio_base <= presupuesto_max) {
          score += 12;
          razones.push(`Tarifa base dentro de tu presupuesto esperado.`);
        } else {
          score -= 15;
        }
      }

      // Custom preferences
      preferencias.forEach((pref) => {
        const pLower = pref.toLowerCase();
        const matchesService = hab.servicios.some((s) => s.toLowerCase().includes(pLower));
        const matchesDesc = hab.descripcion.toLowerCase().includes(pLower);
        if (matchesService || matchesDesc) {
          score += 7;
          razones.push(`Incluye tu preferencia de "${pref}".`);
        }
      });

      // Rating score
      const rating = getRatingHabitacion(hab.id_habitacion);
      if (rating.promedio >= 4.8) {
        score += 5;
        razones.push(`Valorada con ${rating.promedio} estrellas por huéspedes.`);
      }

      const afinidad = Math.min(99, Math.max(50, score));

      let destacado = 'Opción sugerida';
      if (afinidad >= 90) destacado = 'Coincidencia Perfecta (Match 90%+)';
      else if (afinidad >= 80) destacado = 'Altamente Recomendada';

      return {
        habitacion: hab,
        puntuacion_afinidad: afinidad,
        razones: razones.slice(0, 3),
        destacado,
      };
    }).filter(Boolean);

    return results.sort((a, b) => b.puntuacion_afinidad - a.puntuacion_afinidad);
  };

  // Feature 2: FAQ Virtual Concierge Chatbot
  const consultarConciergeChat = async (mensajeUsuario: string): Promise<MensajeChat> => {
    const raw = mensajeUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // 1. Room recommendation trigger
    if (
      raw.includes('recomiend') ||
      raw.includes('sugier') ||
      raw.includes('cual habitacion') ||
      raw.includes('pareja') ||
      raw.includes('familia') ||
      raw.includes('suite')
    ) {
      let motivo: 'romantico' | 'negocios' | 'familiar' | 'relax' = 'relax';
      let hues = 2;
      if (raw.includes('pareja') || raw.includes('romanti') || raw.includes('novi') || raw.includes('espos')) {
        motivo = 'romantico';
      } else if (raw.includes('familia') || raw.includes('hijos') || raw.includes('ninos')) {
        motivo = 'familiar';
        hues = 4;
      } else if (raw.includes('negocio') || raw.includes('trabajo') || raw.includes('solo')) {
        motivo = 'negocios';
        hues = 1;
      }

      const recs = recomendarHabitacionesIA({
        motivo_viaje: motivo,
        huespedes: hues,
        preferencias: ['balcón', 'desayuno'],
      });

      const top = recs[0];
      return {
        id: `chat-${Date.now()}`,
        emisor: 'asistente',
        texto: `Para tu viaje ${motivo === 'romantico' ? 'romántico en pareja' : motivo === 'familiar' ? 'en familia' : 'de descanso'}, te recomiendo la Habitación ${top.habitacion.numero} (${top.habitacion.descripcion.slice(0, 85)}...). Cuenta con un ${top.puntuacion_afinidad}% de afinidad con tus criterios.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sugerencia_habitacion: top.habitacion,
      };
    }

    // 2. Keyword match in FAQ_ITEMS
    for (const faq of FAQ_ITEMS) {
      const match = faq.palabrasClave.some((kw) => raw.includes(kw));
      if (match) {
        return {
          id: `chat-${Date.now()}`,
          emisor: 'asistente',
          texto: faq.respuesta,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
    }

    // 3. Fallback answer
    return {
      id: `chat-${Date.now()}`,
      emisor: 'asistente',
      texto: `En Alborada Hotel Boutique estamos para servirte. Puedes preguntarme sobre Check-in (3:00 PM), Check-out (12:00 PM), políticas de cancelación (48 horas), desayuno buffet incluido, piscina climatizada, cupones promocionales o solicitarme una recomendación de habitación a tu medida.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Feature 3: Basic Occupancy Forecasting Engine
  const calcularPrediccionOcupacion = (diasFuturos: number = 30): PrediccionOcupacionDia[] => {
    const list: PrediccionOcupacionDia[] = [];
    const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const totalHabs = habitaciones.length || 30;
    const baseDate = new Date(2026, 11, 15); // Dec 15, 2026

    for (let i = 0; i < diasFuturos; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      // Confirmed active reservations for that day
      const realOccupied = reservas.filter((r) => {
        if (r.estado === 'CANCELADA') return false;
        return dateStr >= r.fecha_entrada && dateStr < r.fecha_salida;
      }).length;

      const realRate = Math.min(100, Math.round((realOccupied / totalHabs) * 100));

      // Day of week weighting
      let dayMultiplier = 0.88;
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        dayMultiplier = 1.30;
      } else if (dayOfWeek === 0) {
        dayMultiplier = 0.95;
      } else if (dayOfWeek === 4) {
        dayMultiplier = 1.05;
      }

      // Holiday seasonal factor
      const dayOfMonth = d.getDate();
      const month = d.getMonth();
      let holidayMultiplier = 1.0;
      if (month === 11 && dayOfMonth >= 22) {
        holidayMultiplier = 1.35;
      } else if (month === 0 && dayOfMonth <= 6) {
        holidayMultiplier = 1.25;
      }

      const estimatedRate = Math.min(
        100,
        Math.max(realRate, Math.round((realRate + 32) * dayMultiplier * holidayMultiplier * 0.68))
      );

      let demandaNivel: 'BAJA' | 'MEDIA' | 'ALTA' | 'MUY_ALTA' = 'MEDIA';
      let tarifaRecomendada = 220000;
      if (estimatedRate >= 85) {
        demandaNivel = 'MUY_ALTA';
        tarifaRecomendada = 265000;
      } else if (estimatedRate >= 65) {
        demandaNivel = 'ALTA';
        tarifaRecomendada = 240000;
      } else if (estimatedRate >= 40) {
        demandaNivel = 'MEDIA';
        tarifaRecomendada = 220000;
      } else {
        demandaNivel = 'BAJA';
        tarifaRecomendada = 195000;
      }

      list.push({
        fecha: dateStr,
        diaSemana: diasSemanaNombres[dayOfWeek],
        ocupacionReal: realRate,
        ocupacionProyectada: estimatedRate,
        demandaNivel,
        tarifaRecomendada,
      });
    }

    return list;
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

    // Automated Notifications Dispatch
    const notifCli: Notificacion = {
      id_notificacion: `notif-${Date.now()}-c`,
      tipo: 'CONFIRMACION',
      titulo: `Reserva creada: ${codigo}`,
      mensaje: `Tu estadía en Habitación ${hab.numero} (${tipo.nombre}) del ${fecha_entrada} al ${fecha_salida} está registrada.`,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leida: false,
      destinatario_rol: 'CLIENTE',
      destinatario_correo: targetCliente.correo,
      enlace_vista: 'mis-reservas',
    };

    const notifAdm: Notificacion = {
      id_notificacion: `notif-${Date.now()}-a`,
      tipo: 'SISTEMA',
      titulo: `Nueva reserva en sistema: ${codigo}`,
      mensaje: `Huésped ${targetCliente.nombre} ${targetCliente.apellido} reservó la Habitación ${hab.numero}.`,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leida: false,
      destinatario_rol: 'ADMINISTRADOR',
      enlace_vista: 'admin-reservas',
    };

    setNotificaciones((prev) => [notifCli, notifAdm, ...prev]);

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

    // RBAC: Client can only cancel their own reservations
    if (isClientAction && currentRole === 'CLIENTE') {
      if (!currentUser.correo || reserva.cliente_correo.trim().toLowerCase() !== currentUser.correo.trim().toLowerCase()) {
        return {
          success: false,
          error: 'Acceso denegado: no tienes autorización para cancelar reservaciones de otros huéspedes.',
        };
      }

      // RN05: 48-hour policy for clients
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

    // Automated Cancellation Notification
    const notifCanc: Notificacion = {
      id_notificacion: `notif-${Date.now()}-canc`,
      tipo: 'SISTEMA',
      titulo: `Reserva cancelada: ${reserva.codigo}`,
      mensaje: `La reserva de la Habitación ${reserva.habitacion_numero} (${reserva.fecha_entrada} al ${reserva.fecha_salida}) ha sido cancelada.`,
      fecha: new Date().toISOString().replace('T', ' ').slice(0, 16),
      leida: false,
      destinatario_rol: isClientAction ? 'ADMINISTRADOR' : 'CLIENTE',
      enlace_vista: isClientAction ? 'admin-reservas' : 'mis-reservas',
    };
    setNotificaciones((prev) => [notifCanc, ...prev]);

    return { success: true };
  };

  // HU10: State Machine Transitions (Admin)
  const cambiarEstadoReserva = (idReserva: number, nuevoEstado: EstadoReserva): { success: boolean; error?: string } => {
    // RBAC Guard
    if (currentRole !== 'ADMINISTRADOR') {
      return { success: false, error: 'Acceso denegado: se requieren permisos de ADMINISTRADOR para modificar el estado de reservas.' };
    }

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
    // RBAC Guard
    if (currentRole !== 'ADMINISTRADOR') {
      return { success: false, error: 'Acceso denegado: se requieren privilegios de ADMINISTRADOR para registrar nuevas habitaciones.' };
    }

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
    // RBAC Guard
    if (currentRole !== 'ADMINISTRADOR') {
      return { success: false, error: 'Acceso denegado: se requieren privilegios de ADMINISTRADOR para editar habitaciones.' };
    }

    if (habitaciones.some((h) => h.id_habitacion !== hab.id_habitacion && h.numero.toLowerCase() === hab.numero.toLowerCase())) {
      return { success: false, error: `El número ${hab.numero} ya está en uso por otra habitación.` };
    }

    setHabitaciones((prev) => prev.map((h) => (h.id_habitacion === hab.id_habitacion ? hab : h)));
    return { success: true };
  };

  const cambiarEstadoHabitacion = (idHabitacion: number, nuevoEstado: EstadoHabitacion) => {
    // RBAC Guard
    if (currentRole !== 'ADMINISTRADOR') return;

    setHabitaciones((prev) =>
      prev.map((h) => (h.id_habitacion === idHabitacion ? { ...h, estado: nuevoEstado } : h))
    );
  };

  // HU08: Deactivate logically instead of deleting if future reservations exist
  const toggleHabitacionActiva = (idHabitacion: number): { success: boolean; error?: string } => {
    // RBAC Guard
    if (currentRole !== 'ADMINISTRADOR') {
      return { success: false, error: 'Acceso denegado: se requieren privilegios de ADMINISTRADOR para cambiar la disponibilidad de habitaciones.' };
    }

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
        notificaciones,
        currentRole,
        currentUser,
        isAuthenticated,
        currentCliente,
        activeView,
        setActiveView,
        switchRole,
        loginAs,
        logout,
        marcarNotificacionLeida,
        marcarTodasNotificacionesLeidas,
        agregarNotificacion,
        recomendarHabitacionesIA,
        consultarConciergeChat,
        calcularPrediccionOcupacion,
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
