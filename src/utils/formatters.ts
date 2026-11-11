export const formatCOP = (val: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val).replace('COP', '').trim();
};

export const formatDateDMY = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

export const formatDateReadable = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getEstadoReservaColor = (estado: string) => {
  switch (estado) {
    case 'PENDIENTE':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/60',
        label: 'Pendiente',
      };
    case 'CONFIRMADA':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        label: 'Confirmada',
      };
    case 'FINALIZADA':
      return {
        bg: 'bg-stone-100 dark:bg-stone-900',
        text: 'text-stone-700 dark:text-stone-300',
        border: 'border-stone-200 dark:border-stone-800',
        label: 'Finalizada',
      };
    case 'CANCELADA':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-800 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800/60',
        label: 'Cancelada',
      };
    default:
      return {
        bg: 'bg-stone-50',
        text: 'text-stone-700',
        border: 'border-stone-200',
        label: estado,
      };
  }
};

export const getEstadoHabitacionColor = (estado: string) => {
  switch (estado) {
    case 'DISPONIBLE':
      return {
        dot: 'bg-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
        label: 'Disponible',
      };
    case 'RESERVADA':
      return {
        dot: 'bg-amber-500',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50/80 dark:bg-amber-950/30',
        label: 'Reservada',
      };
    case 'OCUPADA':
      return {
        dot: 'bg-sky-500',
        text: 'text-sky-700 dark:text-sky-400',
        bg: 'bg-sky-50/80 dark:bg-sky-950/30',
        label: 'Ocupada',
      };
    case 'MANTENIMIENTO':
      return {
        dot: 'bg-rose-500',
        text: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50/80 dark:bg-rose-950/30',
        label: 'Mantenimiento',
      };
    default:
      return {
        dot: 'bg-stone-400',
        text: 'text-stone-600',
        bg: 'bg-stone-50',
        label: estado,
      };
  }
};
