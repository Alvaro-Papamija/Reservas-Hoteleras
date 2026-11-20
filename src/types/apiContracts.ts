/**
 * Contratos de datos de la API REST de Hotel Alborada (Spring Boot 3.3.4 / OpenAPI 3)
 */

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  error?: string;
  status?: number;
}

// ==========================================
// RESERVAS DTOs
// ==========================================
export interface CrearReservaApiRequest {
  idHabitacion: number;
  idCliente: number;
  fechaEntrada: string; // YYYY-MM-DD
  fechaSalida: string;   // YYYY-MM-DD
  cantidadHuespedes: number;
  notas?: string;
  cuponCodigo?: string;
}

export interface ReservaApiResponse {
  idReserva: number;
  codigo: string;
  idCliente: number;
  clienteNombre: string;
  clienteDocumento: string;
  clienteCorreo: string;
  clienteTelefono?: string;
  idHabitacion: number;
  habitacionNumero: string;
  habitacionTipo: string;
  fechaEntrada: string;
  fechaSalida: string;
  cantidadHuespedes: number;
  precioNoche: number;
  cantidadNoches: number;
  subtotal: number;
  descuento: number;
  total: number;
  saldo: number;
  cuponAplicado?: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CHECK_IN' | 'FINALIZADA' | 'CANCELADA';
  numeroLlave?: string;
  fechaCheckin?: string;
  fechaCheckout?: string;
  fechaCreacion: string;
  notas?: string;
  motivoCancelacion?: string;
}

export interface ModificarFechasApiRequest {
  fechaEntrada: string;
  fechaSalida: string;
}

export interface CheckInApiRequest {
  numeroLlave: string;
}

export interface CancelarReservaApiRequest {
  motivo: string;
}

// ==========================================
// PAGOS DTOs
// ==========================================
export interface RegistrarPagoApiRequest {
  idReserva: number;
  monto: number;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  referencia?: string;
}

export interface PagoApiResponse {
  idPago: number;
  idReserva: number;
  monto: number;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  fecha: string;
  reciboCaja: string;
  referencia?: string;
  registradoPor?: string;
}

// ==========================================
// CLIENTES DTOs
// ==========================================
export interface CrearClienteApiRequest {
  nombre: string;
  apellido: string;
  tipoDocumento?: string;
  documento: string;
  telefono: string;
  correo: string;
  direccion?: string;
  password?: string;
}

export interface ClienteApiResponse {
  idCliente: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  documento: string;
  telefono: string;
  correo: string;
  direccion?: string;
  fechaRegistro: string;
}

// ==========================================
// HABITACIONES DTOs
// ==========================================
export interface HabitacionApiResponse {
  idHabitacion: number;
  idTipo: number;
  tipoNombre: string;
  numero: string;
  piso: number;
  precioBase: number;
  capacidad: number;
  descripcion: string;
  imagen: string;
  estado: 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'MANTENIMIENTO';
  activa: boolean;
}

export interface HealthApiResponse {
  status: string;
  app: string;
  version: string;
  timestamp: string;
}
