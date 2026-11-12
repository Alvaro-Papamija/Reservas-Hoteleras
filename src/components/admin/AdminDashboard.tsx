import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { formatCOP, formatDateDMY, getEstadoReservaColor, getEstadoHabitacionColor } from '../../utils/formatters';
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const {
    habitaciones,
    reservas,
    clientes,
    setActiveView,
    cambiarEstadoReserva,
  } = useHotel();

  // Metrics computation
  const totalHabitaciones = habitaciones.length;
  const disponibles = habitaciones.filter((h) => h.estado === 'DISPONIBLE').length;
  const ocupadas = habitaciones.filter((h) => h.estado === 'OCUPADA').length;
  const mantenimiento = habitaciones.filter((h) => h.estado === 'MANTENIMIENTO').length;
  const reservadas = habitaciones.filter((h) => h.estado === 'RESERVADA').length;

  const totalIngresos = reservas
    .filter((r) => r.estado !== 'CANCELADA')
    .reduce((acc, r) => acc + r.total, 0);

  const pendientesCount = reservas.filter((r) => r.estado === 'PENDIENTE').length;
  const confirmadasCount = reservas.filter((r) => r.estado === 'CONFIRMADA').length;

  // Occupancy rate
  const tasaOcupacion = Math.round(((ocupadas + reservadas) / totalHabitaciones) * 100);

  // Recent reservations (top 5)
  const recentReservations = reservas.slice(0, 5);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Panel Administrativo Principal</span>
            <span aria-hidden="true">·</span>
            <span>Hotel Alborada Boutique</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 tracking-tight">
            Dashboard Operativo
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Control en tiempo real de inventario de habitaciones, estado de reservas y flujo de ocupación general.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('admin-calendario')}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Calendario Visual</span>
          </button>
          <button
            onClick={() => setActiveView('admin-habitaciones')}
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 shadow-xs transition-colors"
          >
            Gestionar Habitaciones
          </button>
          <button
            onClick={() => setActiveView('admin-reservas')}
            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Ver Todas las Reservas
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (PRD HU13 & USER_FLOW §2.2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Habitaciones */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Inventario Total</span>
            <BedDouble className="w-4 h-4 text-stone-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-stone-900 font-mono-numbers">
              {totalHabitaciones}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5">
              <span>Distribuido en 3 pisos</span>
            </div>
          </div>
        </div>

        {/* Card 2: Disponibles vs Ocupadas */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Disponibles / Ocupadas</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-stone-900 font-mono-numbers">
              {disponibles} <span className="text-lg font-normal text-stone-400">/ {ocupadas}</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {mantenimiento} en mantenimiento
            </div>
          </div>
        </div>

        {/* Card 3: Ocupación */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Tasa de Ocupación</span>
            <TrendingUp className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-900 font-mono-numbers">
              {tasaOcupacion}%
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-700 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${tasaOcupacion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Ingresos Estimados */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Ingresos Estimados</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 font-mono-numbers">
              {formatCOP(totalIngresos)}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              {reservas.length} reservas registradas
            </div>
          </div>
        </div>
      </div>

      {/* Floor by Floor Occupancy Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Distribución Operativa por Piso
            </h3>
            <p className="text-xs text-stone-500">
              Visualización rápida de estado de habitaciones (10 habitaciones por nivel).
            </p>
          </div>
          <button
            onClick={() => setActiveView('admin-habitaciones')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <span>Ver mapa de habitaciones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((piso) => {
            const roomsInFloor = habitaciones.filter((h) => h.piso === piso);
            const disp = roomsInFloor.filter((h) => h.estado === 'DISPONIBLE').length;
            const ocup = roomsInFloor.filter((h) => h.estado === 'OCUPADA').length;
            const mant = roomsInFloor.filter((h) => h.estado === 'MANTENIMIENTO').length;
            const res = roomsInFloor.filter((h) => h.estado === 'RESERVADA').length;

            return (
              <div key={piso} className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">Piso {piso}</span>
                  <span className="text-xs text-stone-500 font-mono-numbers">
                    {disp} libres / 10
                  </span>
                </div>

                {/* Micro blocks for 10 rooms */}
                <div className="grid grid-cols-5 gap-1.5">
                  {roomsInFloor.map((r) => {
                    const c = getEstadoHabitacionColor(r.estado);
                    return (
                      <div
                        key={r.id_habitacion}
                        title={`Hab ${r.numero} - ${r.estado}`}
                        className={`py-1 text-center rounded text-[11px] font-mono-numbers font-medium border ${
                          r.estado === 'DISPONIBLE'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : r.estado === 'OCUPADA'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : r.estado === 'RESERVADA'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {r.numero}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> {disp} libres
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-sky-500" /> {ocup} ocupadas
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {mant} mant.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reservations Feed with Fast State Transitions */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-stone-900">
              Últimas Reservas Registradas
            </h3>
            <p className="text-xs text-stone-500">
              Solicitudes recientes con control directo de confirmación (HU10).
            </p>
          </div>

          <button
            onClick={() => setActiveView('admin-reservas')}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900"
          >
            Ver listado completo ({reservas.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2">Código</th>
                <th className="py-3 px-2">Huésped</th>
                <th className="py-3 px-2">Habitación</th>
                <th className="py-3 px-2">Fechas</th>
                <th className="py-3 px-2 text-right">Total</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentReservations.map((r) => {
                const badge = getEstadoReservaColor(r.estado);

                return (
                  <tr key={r.id_reserva} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-2 font-mono-numbers font-semibold text-stone-900">
                      {r.codigo}
                    </td>
                    <td className="py-3 px-2 font-medium text-stone-800">
                      {r.cliente_nombre}
                    </td>
                    <td className="py-3 px-2 text-stone-600">
                      Hab. {r.habitacion_numero} ({r.habitacion_tipo})
                    </td>
                    <td className="py-3 px-2 font-mono-numbers text-stone-600">
                      {formatDateDMY(r.fecha_entrada)} → {formatDateDMY(r.fecha_salida)} ({r.cantidad_noches}n)
                    </td>
                    <td className="py-3 px-2 font-mono-numbers font-bold text-stone-900 text-right">
                      {formatCOP(r.total)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {r.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => cambiarEstadoReserva(r.id_reserva, 'CONFIRMADA')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] transition-colors"
                        >
                          Confirmar
                        </button>
                      )}
                      {r.estado === 'CONFIRMADA' && (
                        <button
                          onClick={() => cambiarEstadoReserva(r.id_reserva, 'FINALIZADA')}
                          className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-900 text-white font-medium text-[11px] transition-colors"
                        >
                          Finalizar
                        </button>
                      )}
                      {(r.estado === 'FINALIZADA' || r.estado === 'CANCELADA') && (
                        <span className="text-[11px] text-stone-400">Sin acciones</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
