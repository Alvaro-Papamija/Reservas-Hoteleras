export type RolUsuario = 'ADMINISTRADOR' | 'CLIENTE';

export type EstadoHabitacion = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'MANTENIMIENTO';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'FINALIZADA';

export interface TipoHabitacion {
  id_tipo: number;
  nombre: 'Individual' | 'Doble' | 'Triple' | 'Familiar' | 'Suite';
  descripcion: string;
  capacidad: number;
  precio_base: number; // en pesos colombianos COP
}

export interface Habitacion {
  id_habitacion: number;
  id_tipo: number;
  numero: string;
  piso: number;
  estado: EstadoHabitacion;
  descripcion: string;
  imagen: string;
  galeria?: string[];
  servicios: string[];
  activa: boolean;
  calificacion_promedio?: number;
  total_resenas?: number;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: boolean;
}

export interface Cliente {
  id_cliente: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  direccion?: string;
  correo: string;
  fecha_registro: string;
}

export interface Reserva {
  id_reserva: number;
  codigo: string; // ej: RH-20261215-0042
  id_cliente: number;
  cliente_nombre: string;
  cliente_documento: string;
  cliente_correo: string;
  cliente_telefono?: string;
  id_habitacion: number;
  habitacion_numero: string;
  habitacion_tipo: string;
  fecha_entrada: string; // YYYY-MM-DD
  fecha_salida: string; // YYYY-MM-DD
  cantidad_huespedes: number;
  precio_noche: number;
  cantidad_noches: number;
  total: number;
  subtotal?: number;
  cupon_aplicado?: string;
  descuento?: number;
  calificacion?: number;
  comentario_calificacion?: string;
  estado: EstadoReserva;
  fecha_creacion: string;
  notas?: string;
}

export interface Cupon {
  codigo: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: number;
  descripcion: string;
  activo: boolean;
  minimo_noches?: number;
}

export interface Resena {
  id_resena: number;
  id_habitacion: number;
  id_reserva?: number;
  cliente_nombre: string;
  calificacion: number; // 1-5
  comentario: string;
  fecha: string;
}

export interface DisponibilidadQuery {
  fecha_entrada: string;
  fecha_salida: string;
  huespedes: number;
  id_tipo?: number;
}
