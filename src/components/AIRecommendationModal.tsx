import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { Habitacion, RecomendacionIAQuery, RecomendacionIAResult } from '../types/hotel';
import { formatCOP } from '../utils/formatters';
import {
  Sparkles,
  X,
  Compass,
  Users,
  DollarSign,
  Heart,
  Briefcase,
  Home,
  Palmtree,
  Star,
  CheckCircle2,
  ArrowRight,
  BedDouble,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHabitacion: (hab: Habitacion) => void;
  onOpenDetails: (hab: Habitacion) => void;
}

export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({
  isOpen,
  onClose,
  onSelectHabitacion,
  onOpenDetails,
}) => {
  const { recomendarHabitacionesIA } = useHotel();

  // Query State
  const [motivo, setMotivo] = useState<'romantico' | 'negocios' | 'familiar' | 'relax'>('romantico');
  const [huespedes, setHuespedes] = useState<number>(2);
  const [presupuesto, setPresupuesto] = useState<number>(300000);
  const [preferencias, setPreferencias] = useState<string[]>(['balcón', 'desayuno']);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [results, setResults] = useState<RecomendacionIAResult[]>([]);

  if (!isOpen) return null;

  const handleTogglePref = (pref: string) => {
    setPreferencias((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const query: RecomendacionIAQuery = {
      motivo_viaje: motivo,
      huespedes,
      presupuesto_max: presupuesto > 0 ? presupuesto : undefined,
      preferencias,
    };
    const recs = recomendarHabitacionesIA(query);
    setResults(recs.slice(0, 3));
    setHasCalculated(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Cerrar recomendador"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-700 text-amber-100 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-800">
                Alborada Intelligence Engine
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-stone-900">
                Recomendador de Habitaciones con IA
              </h2>
            </div>
          </div>

          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            Cuéntanos sobre tu viaje y nuestro algoritmo de hospitalidad analizará disponibilidad, características, amenidades y opiniones para recomendarte la suite perfecta.
          </p>

          {/* Form */}
          <form onSubmit={handleCalculate} className="space-y-5">
            {/* 1. Motivo del viaje */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                1. ¿Cuál es el motivo principal de tu estancia?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'romantico', label: 'Escapada Pareja', icon: Heart },
                  { id: 'relax', label: 'Descanso / Relax', icon: Palmtree },
                  { id: 'familiar', label: 'Viaje Familiar', icon: Home },
                  { id: 'negocios', label: 'Negocios / Trabajo', icon: Briefcase },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = motivo === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMotivo(item.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50/80 text-amber-950 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Huéspedes y Presupuesto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                  2. Número de Huéspedes
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setHuespedes(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono-numbers font-bold border transition-colors ${
                        huespedes === num
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {num} {num === 1 ? 'pers.' : 'pers.'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Presupuesto Máximo por Noche
                  </label>
                  <span className="text-xs font-mono-numbers font-bold text-amber-900">
                    {formatCOP(presupuesto)}
                  </span>
                </div>
                <input
                  type="range"
                  min="120000"
                  max="450000"
                  step="20000"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(Number(e.target.value))}
                  className="w-full accent-amber-700 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono-numbers mt-1">
                  <span>$ 120.000</span>
                  <span>$ 450.000</span>
                </div>
              </div>
            </div>

            {/* 3. Preferencias clave */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                3. Amenidades y Preferencias Deseadas
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Balcón privado',
                  'Desayuno buffet',
                  'Jacuzzi hidromasaje',
                  'Vista a piscina',
                  'Wi-Fi 500 Mbps',
                  'Piso 1 (Jardines)',
                  'Smart TV 65"',
                ].map((pref) => {
                  const isChecked = preferencias.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => handleTogglePref(pref)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-semibold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generar Recomendación Personalizada</span>
            </button>
          </form>

          {/* Results Section */}
          {hasCalculated && (
            <div className="mt-8 pt-6 border-t border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-stone-900">
                  Resultados del Análisis IA ({results.length} sugerencias)
                </h3>
                <span className="text-xs font-semibold text-amber-800">
                  Ordenadas por afinidad
                </span>
              </div>

              <div className="space-y-3">
                {results.map((item, idx) => (
                  <div
                    key={item.habitacion.id_habitacion}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-amber-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.habitacion.imagen}
                          alt={item.habitacion.numero}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 text-sm">
                              Habitación {item.habitacion.numero}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {item.puntuacion_afinidad}% Afinidad
                            </span>
                            <span className="text-[10px] text-stone-400">
                              Piso {item.habitacion.piso}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                            {item.habitacion.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] text-stone-400 block">Tarifa sugerida</span>
                        <span className="text-sm font-bold font-mono-numbers text-stone-900">
                          {formatCOP(
                            item.habitacion.id_tipo === 1 ? 120000 :
                            item.habitacion.id_tipo === 2 ? 180000 :
                            item.habitacion.id_tipo === 3 ? 240000 :
                            item.habitacion.id_tipo === 4 ? 320000 : 420000
                          )}
                          <span className="text-[10px] text-stone-400 font-normal"> / noche</span>
                        </span>
                      </div>
                    </div>

                    {/* AI Reasons */}
                    <div className="pt-2 border-t border-stone-200/60 flex flex-wrap gap-2 text-[11px] text-stone-600">
                      {item.razones.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenDetails(item.habitacion);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
                      >
                        Ver Detalles
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectHabitacion(item.habitacion);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span>Reservar Esta Suite</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
