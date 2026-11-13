import { useState, useEffect } from 'react';

/**
 * Hook para aplicar debounce sobre cualquier valor o entrada de usuario.
 * @param value Valor actual (por ejemplo texto de búsqueda)
 * @param delayMs Tiempo de espera en milisegundos antes de propagar el cambio
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

