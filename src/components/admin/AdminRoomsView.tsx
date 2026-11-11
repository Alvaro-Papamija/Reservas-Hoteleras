import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Habitacion, EstadoHabitacion } from '../../types/hotel';
import { formatCOP, getEstadoHabitacionColor } from '../../utils/formatters';
import {
  Plus,
  Edit2,
  Trash2,
  SlidersHorizontal,
  Check,
  AlertCircle,
  X,
  ShieldAlert,
  Power,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminRoomsView: React.FC = () => {
  const {
    habitaciones,
    tipos,
    addHabitacion,
    updateHabitacion,
    cambiarEstadoHabitacion,
    toggleHabitacionActiva,
  } = useHotel();

  const [filterPiso, setFilterPiso] = useState<number | 'todos'>('todos');
  const [filterEstado, setFilterEstado] = useState<EstadoHabitacion | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields
  const [numero, setNumero] = useState('');
  const [idTipo, setIdTipo] = useState<number>(2);
  const [piso, setPiso] = useState<number>(1);
  const [estado, setEstado] = useState<EstadoHabitacion>('DISPONIBLE');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('/src/assets/images/habitacion_doble_deluxe_1794431402242.jpg');
  const [serviciosStr, setServiciosStr] = useState('Wi-Fi 500 Mbps, Smart TV 55", Baño privado, Aire acondicionado');

  const filtered = habitaciones.filter((h) => {
    if (filterPiso !== 'todos' && h.piso !== filterPiso) return false;
    if (filterEstado !== 'todos' && h.estado !== filterEstado) return false;
    if (searchQuery && !h.numero.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingHabitacion(null);
    setNumero('');
    setIdTipo(tipos[0]?.id_tipo || 1);
    setPiso(1);
    setEstado('DISPONIBLE');
    setDescripcion('');
    setImagen('/src/assets/images/habitacion_doble_deluxe_1794431402242.jpg');
    setServiciosStr('Wi-Fi 500 Mbps, Smart TV 55", Baño privado, Aire acondicionado');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (h: Habitacion) => {
    setEditingHabitacion(h);
    setNumero(h.numero);
    setIdTipo(h.id_tipo);
    setPiso(h.piso);
    setEstado(h.estado);
    setDescripcion(h.descripcion);
    setImagen(h.imagen);
    setServiciosStr(h.servicios.join(', '));
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const servicios = serviciosStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingHabitacion) {
      const res = updateHabitacion({
        ...editingHabitacion,
        numero,
        id_tipo: idTipo,
        piso,
        estado,
        descripcion,
        imagen,
        servicios,
      });

      if (res.success) {
        setIsModalOpen(false);
        showToast(`Habitación ${numero} actualizada exitosamente.`);
      } else {
        setModalError(res.error || 'Error al actualizar habitación.');
      }
    } else {
      const res = addHabitacion({
        numero,
        id_tipo: idTipo,
        piso,
        estado,
        descripcion,
        imagen,
        servicios,
        activa: true,
      });

      if (res.success) {
        setIsModalOpen(false);
        showToast(`Habitación ${numero} registrada exitosamente.`);
      } else {
        setModalError(res.error || 'Error al registrar habitación.');
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleActiva = (h: Habitacion) => {
    const res = toggleHabitacionActiva(h.id_habitacion);
    if (res.success) {
      showToast(`Habitación ${h.numero} ${h.activa ? 'desactivada' : 'activada'} en el catálogo.`);
    } else {
      showToast(res.error || 'No se pudo cambiar el estado.');
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            Inventario & Capacidad Hotelera
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-900 tracking-tight">
            Gestión de Habitaciones ({habitaciones.length})
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Configuración de números de habitación, tipos asociados, estados operativos y disponibilidad.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Habitación</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-stone-900 text-white text-xs font-medium flex items-center justify-between shadow-lg">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Piso */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-stone-500 mr-1">Piso:</span>
            {['todos', 1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPiso(p as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterPiso === p
                    ? 'bg-amber-700 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {p === 'todos' ? 'Todos' : `Piso ${p}`}
              </button>
            ))}
          </div>

          <span className="text-stone-300">|</span>

          {/* Estado */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-stone-500 mr-1">Estado:</span>
            {(['todos', 'DISPONIBLE', 'RESERVADA', 'OCUPADA', 'MANTENIMIENTO'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterEstado(st as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterEstado === st
                    ? 'bg-stone-900 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st === 'todos' ? 'Todos' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Search */}
        <input
          type="text"
          placeholder="Buscar por número..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs w-48 outline-none focus:ring-1 focus:ring-amber-700"
        />
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-500 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 font-semibold">Núm.</th>
                <th className="py-3.5 px-4 font-semibold">Tipo</th>
                <th className="py-3.5 px-4 font-semibold">Piso</th>
                <th className="py-3.5 px-4 font-semibold">Tarifa Noche</th>
                <th className="py-3.5 px-4 font-semibold">Capacidad</th>
                <th className="py-3.5 px-4 font-semibold">Estado Operativo</th>
                <th className="py-3.5 px-4 font-semibold">Catálogo</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((hab) => {
                const tipo = tipos.find((t) => t.id_tipo === hab.id_tipo);
                const precio = tipo ? tipo.precio_base : 180000;
                const statusStyle = getEstadoHabitacionColor(hab.estado);

                return (
                  <tr key={hab.id_habitacion} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono-numbers font-bold text-stone-900">
                      {hab.numero}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-stone-800">
                      {tipo?.nombre || 'General'}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      Piso {hab.piso}
                    </td>

                    <td className="py-3.5 px-4 font-mono-numbers font-medium text-stone-900">
                      {formatCOP(precio)}
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">
                      Hasta {tipo?.capacidad} pers.
                    </td>

                    <td className="py-3.5 px-4">
                      {/* Interactive inline state changer dropdown (HU14) */}
                      <select
                        value={hab.estado}
                        onChange={(e) =>
                          cambiarEstadoHabitacion(hab.id_habitacion, e.target.value as EstadoHabitacion)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${statusStyle.bg} ${statusStyle.text} border-stone-200`}
                      >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="RESERVADA">Reservada</option>
                        <option value="OCUPADA">Ocupada</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          hab.activa
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {hab.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(hab)}
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
                          title="Editar información"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleActiva(hab)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            hab.activa
                              ? 'border-amber-200 text-amber-800 hover:bg-amber-50'
                              : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={hab.activa ? 'Desactivar habitación' : 'Activar habitación'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Room (HU08) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-stone-900">
                  {editingHabitacion ? `Editar Habitación ${editingHabitacion.numero}` : 'Registrar Nueva Habitación'}
                </h3>
                <span className="text-xs text-stone-500">
                  Definición de atributos, tipo y servicios asociados
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Número de Habitación *
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ej: 204"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono-numbers text-xs outline-none focus:ring-1 focus:ring-amber-700"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Piso de Ubicación *
                  </label>
                  <select
                    value={piso}
                    onChange={(e) => setPiso(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value={1}>Piso 1 (Planta Baja / Jardín)</option>
                    <option value={2}>Piso 2 (Intermedio / Balcón)</option>
                    <option value={3}>Piso 3 (Superior / Panorámico)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Tipo de Habitación *
                  </label>
                  <select
                    value={idTipo}
                    onChange={(e) => setIdTipo(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    {tipos.map((t) => (
                      <option key={t.id_tipo} value={t.id_tipo}>
                        {t.nombre} (máx. {t.capacidad} - {formatCOP(t.precio_base)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoHabitacion)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Descripción Arquitectónica & Espacial *
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles de iluminación, vista, lencería y acabados..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700 resize-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Servicios Incluidos (separados por coma)
                </label>
                <input
                  type="text"
                  value={serviciosStr}
                  onChange={(e) => setServiciosStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-1 focus:ring-amber-700"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold shadow-xs"
                >
                  Guardar Habitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
