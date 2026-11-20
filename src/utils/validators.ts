/**
 * Módulo de validaciones de producción para Hotel Alborada
 * Valida reglas de negocio, formatos colombianos (DIAN / Ley 1581) y seguridad financiera.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida formato de correo electrónico según estándar RFC 5322 simplificado
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'El correo electrónico es requerido.' };
  }
  const cleanEmail = email.trim();
  if (cleanEmail.length > 254) {
    return { valid: false, error: 'El correo electrónico excede la longitud máxima permitida.' };
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, error: 'Ingrese una dirección de correo electrónico válida (ej: usuario@dominio.com).' };
  }
  return { valid: true };
}

/**
 * Valida número de teléfono celular colombiano (10 dígitos comenzando por 3 o formato E.164 +57)
 */
export function validateColombianPhone(phone: string): ValidationResult {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'El número de teléfono es requerido.' };
  }
  // Eliminar espacios, guiones y paréntesis
  const digits = phone.replace(/[\s\-()]/g, '');

  // Formato internacional +573XXXXXXXXX
  if (digits.startsWith('+57')) {
    const localPart = digits.slice(3);
    if (/^3\d{9}$/.test(localPart)) {
      return { valid: true };
    }
    return { valid: false, error: 'El número móvil colombiano con prefijo +57 debe tener 10 dígitos y empezar por 3.' };
  }

  // Formato local 3XXXXXXXXX
  if (/^3\d{9}$/.test(digits)) {
    return { valid: true };
  }

  // Línea fija nacional con indicativo unificado 60X (ej: 601XXXXXXX, 602XXXXXXX)
  if (/^60[1-8]\d{7}$/.test(digits)) {
    return { valid: true };
  }

  return { valid: false, error: 'Ingrese un número de celular válido en Colombia (10 dígitos comenzando con 3).' };
}

/**
 * Valida documento de identidad según tipo (Cédula de Ciudadanía, Extranjería, Pasaporte)
 */
export function validateDocumento(doc: string, tipo: string = 'CC'): ValidationResult {
  if (!doc || typeof doc !== 'string') {
    return { valid: false, error: 'El número de documento es requerido.' };
  }
  const cleanDoc = doc.trim().replace(/\./g, '');

  switch (tipo) {
    case 'CC':
    case 'TI':
      if (!/^\d{6,10}$/.test(cleanDoc)) {
        return { valid: false, error: 'La Cédula de Ciudadanía / Tarjeta de Identidad debe tener entre 6 y 10 dígitos numéricos.' };
      }
      break;
    case 'CE':
      if (!/^\d{6,10}$/.test(cleanDoc) && !/^[A-Za-z0-9]{6,12}$/.test(cleanDoc)) {
        return { valid: false, error: 'La Cédula de Extranjería debe tener entre 6 y 10 caracteres válidos.' };
      }
      break;
    case 'PAS':
      if (!/^[A-Za-z0-9]{6,15}$/.test(cleanDoc)) {
        return { valid: false, error: 'El Pasaporte debe tener entre 6 y 15 caracteres alfanuméricos.' };
      }
      break;
    case 'NIT':
      if (!/^\d{8,11}$/.test(cleanDoc.replace('-', ''))) {
        return { valid: false, error: 'El NIT debe tener entre 8 y 11 dígitos numéricos.' };
      }
      break;
    default:
      if (cleanDoc.length < 5 || cleanDoc.length > 20) {
        return { valid: false, error: 'El documento debe tener entre 5 y 20 caracteres.' };
      }
  }

  return { valid: true };
}

/**
 * Algoritmo de Luhn (módulo 10) para validación de tarjetas de crédito y débito
 */
export function validateLuhnCard(cardNumber: string): { valid: boolean; cardBrand?: string; error?: string } {
  if (!cardNumber) {
    return { valid: false, error: 'El número de tarjeta es requerido.' };
  }
  const digits = cardNumber.replace(/[\s\-]/g, '');

  if (!/^\d{13,19}$/.test(digits)) {
    return { valid: false, error: 'El número de tarjeta debe contener entre 13 y 19 dígitos numéricos.' };
  }

  // Detección de franquicia
  let cardBrand = 'Desconocida';
  if (/^4/.test(digits)) {
    cardBrand = 'Visa';
  } else if (/^(5[1-5]|2[2-7])/.test(digits)) {
    cardBrand = 'Mastercard';
  } else if (/^3[47]/.test(digits)) {
    cardBrand = 'American Express';
  } else if (/^(6011|65|64[4-9])/.test(digits)) {
    cardBrand = 'Discover';
  }

  // Verificación Algoritmo de Luhn
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    alternate = !alternate;
  }

  if (sum % 10 !== 0) {
    return { valid: false, cardBrand, error: 'El número de tarjeta no es válido (falla verificación Luhn).' };
  }

  return { valid: true, cardBrand };
}

/**
 * Valida la fecha de vencimiento de tarjeta en formato MM/AA o MM/AAAA
 */
export function validateCardExpiry(expiry: string): ValidationResult {
  if (!expiry) {
    return { valid: false, error: 'La fecha de expiración es requerida.' };
  }
  const cleanExpiry = expiry.trim();
  const match = cleanExpiry.match(/^(\d{2})\/?(\d{2}|\d{4})$/);
  if (!match) {
    return { valid: false, error: 'Ingrese el vencimiento en formato MM/AA (ej: 08/28).' };
  }

  const month = parseInt(match[1], 10);
  let year = parseInt(match[2], 10);
  if (year < 100) {
    year += 2000;
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'El mes de vencimiento debe estar entre 01 y 12.' };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'La tarjeta se encuentra vencida.' };
  }

  if (year > currentYear + 25) {
    return { valid: false, error: 'El año de vencimiento no parece válido.' };
  }

  return { valid: true };
}

/**
 * Valida el código de seguridad CVV/CVC según la franquicia
 */
export function validateCardCVV(cvv: string, cardBrand?: string): ValidationResult {
  if (!cvv) {
    return { valid: false, error: 'El código de seguridad CVV es requerido.' };
  }
  const cleanCvv = cvv.trim();
  const requiredLength = cardBrand === 'American Express' ? 4 : 3;

  const regex = requiredLength === 4 ? /^\d{4}$/ : /^\d{3}$/;
  if (!regex.test(cleanCvv)) {
    return {
      valid: false,
      error: `El código CVV para ${cardBrand || 'esta tarjeta'} debe contener ${requiredLength} dígitos.`,
    };
  }

  return { valid: true };
}

/**
 * Valida coherencia y rango de fechas de reserva
 */
export function validateReservationDates(fechaEntrada: string, fechaSalida: string): {
  valid: boolean;
  error?: string;
  noches?: number;
} {
  if (!fechaEntrada || !fechaSalida) {
    return { valid: false, error: 'Las fechas de entrada y salida son requeridas.' };
  }

  const start = new Date(fechaEntrada);
  const end = new Date(fechaSalida);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Las fechas ingresadas no tienen un formato válido (YYYY-MM-DD).' };
  }

  // Normalizar fechas a medianoche local
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  const noches = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (noches <= 0) {
    return { valid: false, error: 'La fecha de salida debe ser posterior a la fecha de entrada (mínimo 1 noche).' };
  }

  if (noches > 30) {
    return { valid: false, error: 'Para estancias superiores a 30 noches, comuníquese directamente con recepción.' };
  }

  return { valid: true, noches };
}

/**
 * Valida que la cantidad de huéspedes no exceda la capacidad máxima
 */
export function validateGuestCapacity(huespedes: number, capacidadMaxima: number): ValidationResult {
  if (!huespedes || huespedes <= 0) {
    return { valid: false, error: 'Debe ingresar al menos 1 huésped.' };
  }
  if (huespedes > capacidadMaxima) {
    return {
      valid: false,
      error: `La cantidad de huéspedes (${huespedes}) supera la capacidad máxima de la suite (${capacidadMaxima} personas).`,
    };
  }
  return { valid: true };
}

/**
 * Valida montos de pago
 */
export function validatePaymentAmount(monto: number, saldoPendiente: number): ValidationResult {
  if (isNaN(monto) || monto <= 0) {
    return { valid: false, error: 'El monto de pago debe ser un valor positivo mayor a cero.' };
  }
  if (monto > saldoPendiente + 100) { // Tolerancia de redondeo mínima
    return {
      valid: false,
      error: `El monto ingresado ($${monto.toLocaleString('es-CO')}) excede el saldo pendiente ($${saldoPendiente.toLocaleString('es-CO')}).`,
    };
  }
  return { valid: true };
}
