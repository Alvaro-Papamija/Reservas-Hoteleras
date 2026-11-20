/**
 * Servicio de integración con la API REST de Hotel Alborada (Spring Boot 3.3.4)
 * Maneja cabeceras JWT, serialización de DTOs, manejo de errores y timeouts.
 */

import {
  CrearReservaApiRequest,
  ReservaApiResponse,
  ModificarFechasApiRequest,
  CheckInApiRequest,
  CancelarReservaApiRequest,
  RegistrarPagoApiRequest,
  PagoApiResponse,
  CrearClienteApiRequest,
  ClienteApiResponse,
  HabitacionApiResponse,
  HealthApiResponse,
} from '../types/apiContracts';

class HotelApiService {
  private baseUrl: string = '/api';
  private timeoutMs: number = 7000;

  constructor() {
    // Si existe una variable de entorno para URL absoluta (ej: http://localhost:8080/api)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
      this.baseUrl = import.meta.env.VITE_API_BASE_URL;
    }
  }

  /**
   * Obtiene el token JWT actual de la sesión almacenada
   */
  private getAuthToken(): string | null {
    try {
      const stored = localStorage.getItem('alborada_auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) return parsed.token;
      }
      return localStorage.getItem('alborada_jwt_token');
    } catch {
      return null;
    }
  }

  /**
   * Helper unificado de peticiones HTTP con control de abort y cabeceras
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), this.timeoutMs);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson.mensaje) {
            errorMessage = errorJson.mensaje;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
          // Si no es JSON, se conserva el statusText
        }
        throw new Error(errorMessage);
      }

      // 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutTimer);
    }
  }

  // ==========================================
  // SALUD & DIAGNÓSTICO
  // ==========================================
  async checkHealth(): Promise<boolean> {
    try {
      const res = await this.request<HealthApiResponse>('/habitaciones/salud', { method: 'GET' });
      return res && res.status === 'OK';
    } catch {
      return false;
    }
  }

  // ==========================================
  // HABITACIONES
  // ==========================================
  async getHabitaciones(): Promise<HabitacionApiResponse[]> {
    return this.request<HabitacionApiResponse[]>('/habitaciones');
  }

  async getHabitacion(id: number): Promise<HabitacionApiResponse> {
    return this.request<HabitacionApiResponse>(`/habitaciones/${id}`);
  }

  async getHabitacionesDisponibles(
    fechaEntrada: string,
    fechaSalida: string,
    capacidad?: number
  ): Promise<HabitacionApiResponse[]> {
    const params = new URLSearchParams({
      fechaEntrada,
      fechaSalida,
    });
    if (capacidad) params.append('capacidad', String(capacidad));
    return this.request<HabitacionApiResponse[]>(`/habitaciones/disponibles?${params.toString()}`);
  }

  async updateEstadoHabitacion(id: number, estado: string): Promise<HabitacionApiResponse> {
    return this.request<HabitacionApiResponse>(`/habitaciones/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // ==========================================
  // RESERVAS
  // ==========================================
  async getReservas(): Promise<ReservaApiResponse[]> {
    return this.request<ReservaApiResponse[]>('/reservas');
  }

  async getReservaById(id: number): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>(`/reservas/${id}`);
  }

  async getReservaByCodigo(codigo: string): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>(`/reservas/codigo/${encodeURIComponent(codigo)}`);
  }

  async getReservasByCliente(idCliente: number): Promise<ReservaApiResponse[]> {
    return this.request<ReservaApiResponse[]>(`/reservas/cliente/${idCliente}`);
  }

  async crearReserva(req: CrearReservaApiRequest): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>('/reservas', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  async modificarFechas(id: number, req: ModificarFechasApiRequest): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>(`/reservas/${id}/fechas`, {
      method: 'PUT',
      body: JSON.stringify(req),
    });
  }

  async registrarCheckIn(id: number, req: CheckInApiRequest): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>(`/reservas/${id}/checkin`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
  }

  async cancelarReserva(id: number, req: CancelarReservaApiRequest): Promise<ReservaApiResponse> {
    return this.request<ReservaApiResponse>(`/reservas/${id}/cancelar`, {
      method: 'PATCH',
      body: JSON.stringify(req),
    });
  }

  // ==========================================
  // CLIENTES
  // ==========================================
  async getClientes(): Promise<ClienteApiResponse[]> {
    return this.request<ClienteApiResponse[]>('/clientes');
  }

  async getClienteById(id: number): Promise<ClienteApiResponse> {
    return this.request<ClienteApiResponse>(`/clientes/${id}`);
  }

  async buscarClientes(query: string): Promise<ClienteApiResponse[]> {
    return this.request<ClienteApiResponse[]>(`/clientes/buscar?q=${encodeURIComponent(query)}`);
  }

  async crearCliente(req: CrearClienteApiRequest): Promise<ClienteApiResponse> {
    return this.request<ClienteApiResponse>('/clientes', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }

  // ==========================================
  // PAGOS
  // ==========================================
  async getPagosPorReserva(idReserva: number): Promise<PagoApiResponse[]> {
    return this.request<PagoApiResponse[]>(`/pagos/reserva/${idReserva}`);
  }

  async registrarPago(req: RegistrarPagoApiRequest): Promise<PagoApiResponse> {
    return this.request<PagoApiResponse>('/pagos', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export const hotelApi = new HotelApiService();
