import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion } from '../types/hotel';
import { formatCOP, formatDateDMY } from '../utils/formatters';
import {
  Calendar,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface DisponibilidadViewProps {
  initialEntrada?: string;
  initialSalida?: string;
  initialHuespedes?: number;
  initialTipoId?: number;
  onSelectHabitacion: (hab: Habitacion, entrada: string, salida: string, huespedes: number) => void;
  onOpenDetails: (hab: Habitacion) => void;
  onBackToHome: () => void;
}

export const DisponibilidadView: React.FC<DisponibilidadViewProps> = ({
  initialEntrada = '2026-12-15',
  initialSalida = '2026-12-18',
  initialHuespedes = 2,
  initialTipoId,
  onSelectHabitacion,
  onOpenDetails,
  onBackToHome,
}) => {
  const { tipos, searchDisponibilidad, calculateNights } = useHotel();

  const [entrada, setEntrada] = useState(initialEntrada);
  const [salida, setSalida] = useState(initialSalida);
  const [huespedes, setHuespedes] = useState(initialHuespedes);
  const [tipoId, setTipoId] = useState<number | undefined>(initialTipoId);
  const [filterPiso, setFilterPiso] = useState<string>('todos');

  // Compute available rooms
  const rawResults = searchDisponibilidad({
    fecha_entrada: entrada,
    fecha_salida: salida,
    huespedes,
    id_tipo: tipoId,
  });

  const availableRooms = rawResults.filter((h) => {
    if (filterPiso !== 'todos' && h.piso.toString() !== filterPiso) return false;
    return true;
  });

  const nights = calculateNights(entrada, salida);

  const getTipoName = (idTipo: number) => {
    return tipos.find((t) => t.id_tipo === idTipo)?.nombre || 'Habitación';
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span>Consulta en tiempo real</span>
          <span aria-hidden="true">·</span>
          <span className="text-amber-800 font-medium">Temporada Alta 2026</span>
        </div>
      </div>

      {/* Query Bar (Compact Editor) */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Entrada
            </label>
            <input
              type="date"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium focus:ring-1 focus:ring-amber-700 outline-none font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Salida
            </label>
            <input
              type="date"
              value={salida}
              onChange={(e) => setSalida(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium focus:ring-1 focus:ring-amber-700 outline-none font-mono-numbers"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Huéspedes
            </label>
            <select
              value={huespedes}
              onChange={(e) => setHuespedes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium focus:ring-1 focus:ring-amber-700 outline-none"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Huésped' : 'Huéspedes'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
              Tipo de Habitación
            </label>
            <select
              value={tipoId || ''}
              onChange={(e) => setTipoId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium focus:ring-1 focus:ring-amber-700 outline-none"
            >
              <option value="">Todos los tipos</option>
              {tipos.map((t) => (
                <option key={t.id_tipo} value={t.id_tipo}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stay summary bar */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-900">
              Estancia calculada: {nights} {nights === 1 ? 'noche' : 'noches'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Del {formatDateDMY(entrada)} al {formatDateDMY(salida)}
            </span>
            <span aria-hidden="true">·</span>
            <span>Para {huespedes} huéspedes</span>
          </div>

          {/* Quick floor filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Piso:</span>
            {['todos', '1', '2', '3'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPiso(p)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  filterPiso === p
                    ? 'bg-amber-700 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p === 'todos' ? 'Todos' : `Piso ${p}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-stone-900">
            Habitaciones Disponibles ({availableRooms.length})
          </h2>
          <p className="text-sm text-stone-500 mt-0.5">
            Tarifas transparentes por noche con impuestos incluidos y cancelación flexible hasta 48 horas.
          </p>
        </div>
      </div>

      {/* Empty State (USER_FLOW §4.2) */}
      {availableRooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-4">
            <Info className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            No hay habitaciones disponibles para esas fechas.
          </h3>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            Todas las habitaciones con capacidad para {huespedes} huéspedes se encuentran ocupadas o en mantenimiento entre el {formatDateDMY(entrada)} y el {formatDateDMY(salida)}.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setEntrada('2026-12-19');
                setSalida('2026-12-22');
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Probar del 19 al 22 de diciembre
            </button>
            <button
              onClick={onBackToHome}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      ) : (
        /* Results Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableRooms.map((hab) => {
            const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
            const precioNoche = tipo ? tipo.precio_base : 180000;
            const totalEstancia = precioNoche * nights;

            return (
              <motion.div
                key={hab.id_habitacion}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image Container with Fallback */}
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={hab.imagen}
                    alt={`Habitación ${hab.numero} - ${getTipoName(hab.id_tipo)}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    Habitación {hab.numero}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-amber-900 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    Piso {hab.piso}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Metadata Kicker (unboxed text, no pills) */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                      <span className="font-semibold text-amber-800">{getTipoName(hab.id_tipo)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Hasta {tipo?.capacidad} huéspedes</span>
                      <span aria-hidden="true">·</span>
                      <span>Piso {hab.piso}</span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                      Habitación {hab.numero} ({getTipoName(hab.id_tipo)})
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                      {hab.descripcion}
                    </p>

                    {/* Services (Unboxed text with bullet separators) */}
                    <div className="text-xs text-stone-500 line-clamp-1 mb-4 flex items-center gap-1.5 flex-wrap">
                      {hab.servicios.slice(0, 3).map((serv, idx) => (
                        <React.Fragment key={serv}>
                          <span className="text-stone-700">{serv}</span>
                          {idx < 2 && <span className="text-stone-300">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-stone-100 mt-2">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-xs text-stone-400 block">Por noche:</span>
                        <span className="text-base font-bold text-stone-900 font-mono-numbers">
                          {formatCOP(precioNoche)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Total ({nights} noches):</span>
                        <span className="text-lg font-bold text-amber-900 font-mono-numbers">
                          {formatCOP(totalEstancia)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenDetails(hab)}
                        className="py-2.5 px-3 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        onClick={() => onSelectHabitacion(hab, entrada, salida, huespedes)}
                        className="py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Reservar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
