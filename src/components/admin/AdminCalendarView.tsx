import React, { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Habitacion, Reserva } from '../../types/hotel';
import { formatCOP, formatDateDMY, getEstadoReservaColor } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  BedDouble,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export const AdminCalendarView: React.FC = () => {
  const { habitaciones, reservas, tipos } = useHotel();

  // Current view period (Default to Dec 2026 where our mock data is centered)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // 0-indexed: 11 is December
  const [selectedPiso, setSelectedPiso] = useState<number | 'TODOS'>('TODOS');
  const [selectedTipo, setSelectedTipo] = useState<number | 'TODOS'>('TODOS');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  // Calculate days in the selected month
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  // Array of days [1, 2, ..., daysInMonth]
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(11);
  };

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return habitaciones.filter((h) => {
      if (selectedPiso !== 'TODOS' && h.piso !== selectedPiso) return false;
      if (selectedTipo !== 'TODOS' && h.id_tipo !== selectedTipo) return false;
      return true;
    });
  }, [habitaciones, selectedPiso, selectedTipo]);

  // Active reservations for this month (excluding cancelled)
  const monthReservas = useMemo(() => {
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    return reservas.filter((r) => {
      if (r.estado === 'CANCELADA') return false;
      // Overlap with current month
      return r.fecha_entrada <= monthEnd && r.fecha_salida >= monthStart;
    });
  }, [reservas, currentYear, currentMonth, daysInMonth]);

  // Helper to format ISO date string for day d
  const getDateStr = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Quick stats for current month
  const totalOccupiedRoomNights = useMemo(() => {
    let count = 0;
    daysArray.forEach((d) => {
      const dStr = getDateStr(d);
      monthReservas.forEach((r) => {
        if (dStr >= r.fecha_entrada && dStr < r.fecha_salida) {
          count++;
        }
      });
    });
    return count;
  }, [daysArray, monthReservas, currentYear, currentMonth]);

  const potentialRoomNights = filteredRooms.length * daysInMonth;
  const occupancyPercentage = potentialRoomNights > 0
    ? Math.round((totalOccupiedRoomNights / potentialRoomNights) * 100)
    : 0;

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Planeación & Asignación
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Calendario Visual de Reservas
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Línea temporal de ocupación por habitación, llegadas y salidas de huéspedes.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-xs self-start md:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-3 text-center min-w-[150px]">
            <span className="font-display font-bold text-stone-900 text-sm block">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <span className="text-[10px] text-stone-400">
              {daysInMonth} días · {monthReservas.length} reservas activas
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetToday}
            className="ml-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
          >
            Diciembre 2026
          </button>
        </div>
      </div>

      {/* Filter and KPI bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Floor Filter */}
        <div>
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Filtrar por Piso
          </label>
          <select
            value={selectedPiso}
            onChange={(e) => setSelectedPiso(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
            className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
          >
            <option value="TODOS">Todos los pisos (30 hab)</option>
            <option value="1">Piso 1 (Hab 101-110)</option>
            <option value="2">Piso 2 (Hab 201-210)</option>
            <option value="3">Piso 3 (Hab 301-310)</option>
          </select>
        </div>

        {/* Room Type Filter */}
        <div>
          <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Tipo de Habitación
          </label>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
            className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 font-medium"
          >
            <option value="TODOS">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t.id_tipo} value={t.id_tipo}>
                {t.nombre} ({t.capacidad} pers.)
              </option>
            ))}
          </select>
        </div>

        {/* Global Occupancy Metric */}
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80">
          <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {occupancyPercentage}%
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-900 block">
              Ocupación del Mes
            </span>
            <span className="text-xs text-amber-800">
              {totalOccupiedRoomNights} noches reservadas
            </span>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 justify-start md:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
            <span>Confirmada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-stone-500 inline-block" />
            <span>Finalizada</span>
          </div>
        </div>
      </div>

      {/* Gantt Timeline View */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  {/* Fixed left header: Room Info */}
                  <th className="sticky left-0 z-20 bg-stone-50 px-4 py-3 text-xs font-bold text-stone-700 uppercase tracking-wider min-w-[150px] border-r border-stone-200">
                    Habitación
                  </th>

                  {/* Day Columns */}
                  {daysArray.map((day) => {
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const dayOfWeek = dateObj.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                    return (
                      <th
                        key={day}
                        className={`text-center py-2 px-1 text-xs border-r border-stone-100 min-w-[34px] w-[34px] select-none ${
                          isWeekend ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <span className="block text-[10px] text-stone-400 font-medium">
                          {WEEKDAY_NAMES[dayOfWeek]}
                        </span>
                        <span className={`font-mono-numbers font-bold text-xs ${
                          isWeekend ? 'text-amber-800' : 'text-stone-700'
                        }`}>
                          {day}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredRooms.map((hab) => {
                  const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
                  const habReservas = monthReservas.filter((r) => r.id_habitacion === hab.id_habitacion);

                  return (
                    <tr key={hab.id_habitacion} className="hover:bg-stone-50/70 transition-colors">
                      {/* Fixed Left Column */}
                      <td className="sticky left-0 z-10 bg-white hover:bg-stone-50 px-4 py-2.5 font-medium border-r border-stone-200 whitespace-nowrap shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-stone-900 font-mono-numbers">
                              Hab. {hab.numero}
                            </span>
                            <span className="text-[10px] text-stone-400 block">
                              {tipo?.nombre} · P{hab.piso}
                            </span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${
                            hab.estado === 'DISPONIBLE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : hab.estado === 'MANTENIMIENTO'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {hab.estado.slice(0, 4)}
                          </span>
                        </div>
                      </td>

                      {/* Day cells */}
                      {daysArray.map((day) => {
                        const dateStr = getDateStr(day);
                        const dateObj = new Date(currentYear, currentMonth, day);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                        // Check if any reservation touches this day
                        const res = habReservas.find(
                          (r) => dateStr >= r.fecha_entrada && dateStr < r.fecha_salida
                        );

                        if (!res) {
                          return (
                            <td
                              key={day}
                              className={`border-r border-stone-100 p-0 text-center ${
                                isWeekend ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <div className="h-9 w-full" />
                            </td>
                          );
                        }

                        // Determine block style based on status
                        const isStart = dateStr === res.fecha_entrada;
                        const isEnd = dateStr === res.fecha_salida;
                        
                        let bgColor = 'bg-emerald-600 text-white';
                        if (res.estado === 'PENDIENTE') bgColor = 'bg-amber-500 text-stone-950 font-semibold';
                        if (res.estado === 'FINALIZADA') bgColor = 'bg-stone-600 text-white';

                        return (
                          <td
                            key={day}
                            className={`border-r border-stone-100 p-0.5 text-center cursor-pointer ${
                              isWeekend ? 'bg-amber-50/30' : ''
                            }`}
                            onClick={() => setSelectedReserva(res)}
                            title={`Reserva ${res.codigo} - ${res.cliente_nombre}`}
                          >
                            <div
                              className={`h-8 w-full flex items-center justify-center text-[10px] transition-all hover:brightness-110 shadow-2xs ${bgColor} ${
                                isStart ? 'rounded-l-md font-bold' : ''
                              } ${isEnd ? 'rounded-r-md' : ''}`}
                            >
                              {isStart ? (
                                <span className="truncate px-1 text-[9px]">
                                  {res.cliente_nombre.split(' ')[0]}
                                </span>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reservation Details Drawer/Modal */}
      {selectedReserva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Detalle de Reserva {selectedReserva.codigo}
                  </h3>
                  <span className="text-xs text-stone-500">
                    Habitación {selectedReserva.habitacion_numero} · {selectedReserva.habitacion_tipo}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${getEstadoReservaColor(selectedReserva.estado).bg} ${getEstadoReservaColor(selectedReserva.estado).text} ${getEstadoReservaColor(selectedReserva.estado).border}`}>
                {selectedReserva.estado}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 mb-5">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[11px]">Huésped Titular:</span>
                <span className="font-bold text-stone-900 block mt-0.5">
                  {selectedReserva.cliente_nombre}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  Doc: {selectedReserva.cliente_documento}
                </span>
                <span className="text-stone-500 text-[11px] block truncate">
                  {selectedReserva.cliente_correo}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[11px]">Fechas de Estadía:</span>
                <span className="font-bold text-stone-900 block mt-0.5 font-mono-numbers">
                  {formatDateDMY(selectedReserva.fecha_entrada)} al {formatDateDMY(selectedReserva.fecha_salida)}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  {selectedReserva.cantidad_noches} {selectedReserva.cantidad_noches === 1 ? 'noche' : 'noches'} · {selectedReserva.cantidad_huespedes} huéspedes
                </span>
              </div>
            </div>

            {/* Financial breakdown including coupons */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs space-y-2 mb-6">
              <div className="flex justify-between text-stone-600">
                <span>Tarifa por noche:</span>
                <span className="font-mono-numbers">{formatCOP(selectedReserva.precio_noche)}</span>
              </div>
              {selectedReserva.subtotal && selectedReserva.descuento ? (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span className="font-mono-numbers">{formatCOP(selectedReserva.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Cupón aplicado ({selectedReserva.cupon_aplicado}):</span>
                    <span className="font-mono-numbers">-{formatCOP(selectedReserva.descuento)}</span>
                  </div>
                </>
              ) : null}
              <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-amber-200">
                <span>Total Liquidado:</span>
                <span className="font-mono-numbers text-base text-amber-900">
                  {formatCOP(selectedReserva.total)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReserva(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
