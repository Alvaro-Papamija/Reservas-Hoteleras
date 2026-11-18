import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../utils/authService';

/**
 * HISTORIA DE USUARIO: [HU-01] Registro de nuevo Cliente
 * Requisito Asociado: RF-01 | Prioridad: Alta | Estimación: 3 SP
 * 
 * CRITERIO DE ACEPTACIÓN (Gherkin):
 * Dado que ingreso datos personales válidos y un correo no registrado,
 * cuando presiono 'Registrarse' aceptando la política de datos (Ley 1581),
 * entonces el sistema crea mi cuenta con rol 'Cliente' y encripta la contraseña con bcrypt (10 rounds).
 */
describe('[HU-01] Registro de nuevo Cliente - BDD Acceptance Tests', () => {
  beforeEach(() => {
    AuthService.clearAllForTesting();
    vi.restoreAllMocks();
  });

  describe('Escenario Exitoso (Happy Path):', () => {
    it('Dado que ingreso datos personales válidos y un correo no registrado, cuando presiono "Registrarse" aceptando la política de datos (Ley 1581), entonces crea la cuenta con rol "CLIENTE" y sesión activa', async () => {
      // Dado: datos válidos de visitante
      const nombre = 'Alejandro Morales';
      const correo = 'alejandro.morales@hotelimperial.com';
      const password = 'PasswordSegura2026*';
      const aceptaPoliticaLey1581 = true;

      // Cuando: presiono registrarse aceptando Ley 1581
      const resultado = await AuthService.register(nombre, correo, password, aceptaPoliticaLey1581);

      // Entonces: la cuenta se crea exitosamente
      expect(resultado.success).toBe(true);
      expect(resultado.user).toBeDefined();
      expect(resultado.user?.nombre).toBe('Alejandro Morales');
      expect(resultado.user?.correo).toBe('alejandro.morales@hotelimperial.com');
      
      // Y: el rol asignado por defecto es 'CLIENTE'
      expect(resultado.user?.rol).toBe('CLIENTE');
      expect(resultado.user?.estado).toBe(true);

      // Y: el token de sesión se emite y almacena de forma segura (sin exponer clave)
      expect(resultado.token).toBeDefined();
      expect(AuthService.getToken()).toBe(resultado.token);
      // Verificación de que la contraseña en texto plano NUNCA queda guardada en el usuario retornado
      expect((resultado.user as unknown as Record<string, unknown>).contrasena).toBeUndefined();
      expect((resultado.user as unknown as Record<string, unknown>).password).toBeUndefined();
    });
  });

  describe('Escenarios de Rechazo y Reglas de Negocio:', () => {
    it('Rechazo por Política de Datos: Si no acepta la política de tratamiento de datos (Ley 1581), se deniega el registro', async () => {
      // Dado: datos válidos pero rechazo de la Ley 1581
      const resultado = await AuthService.register(
        'Carlos Gómez',
        'carlos.gomez@ejemplo.com',
        'ClaveValida123*',
        false // No aceptó la política
      );

      // Entonces: se rechaza la solicitud
      expect(resultado.success).toBe(false);
      expect(resultado.token).toBeUndefined();
      expect(resultado.user).toBeUndefined();
      expect(resultado.error).toContain('Ley 1581 de 2012');
    });

    it('Rechazo por Correo Duplicado: Si el correo ya existe en el backend, no permite registrar duplicados', async () => {
      // Simulamos respuesta 400 del backend para correo ya existente
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ mensaje: 'El correo electrónico ya se encuentra registrado.' }),
      } as Response);

      const resultado = await AuthService.register(
        'Usuario Existente',
        'duplicado@ejemplo.com',
        'Clave12345*',
        true
      );

      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('El correo electrónico ya se encuentra registrado.');
    });

    it('Rechazo por Nombre Inválido: Menor a 2 caracteres o vacío', async () => {
      const resultadoVacio = await AuthService.register('', 'test@hotel.com', 'Pass12345*');
      expect(resultadoVacio.success).toBe(false);
      expect(resultadoVacio.error).toBe('El nombre completo es obligatorio.');

      const resultadoCorto = await AuthService.register('A', 'test@hotel.com', 'Pass12345*');
      expect(resultadoCorto.success).toBe(false);
      expect(resultadoCorto.error).toBe('El nombre debe contener al menos 2 caracteres.');
    });

    it('Rechazo por Formato de Correo Inválido: Rechaza direcciones sin dominio o con formato erróneo', async () => {
      const resultado = await AuthService.register('Pedro Perez', 'correo-invalido', 'Pass12345*');
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('Por favor ingrese un correo electrónico con formato válido.');
    });

    it('Rechazo por Contraseña Insegura: Menor a 6 caracteres', async () => {
      const resultado = await AuthService.register('Maria Lopez', 'maria@ejemplo.com', '12345');
      expect(resultado.success).toBe(false);
      expect(resultado.error).toBe('La contraseña debe tener al menos 6 caracteres.');
    });
  });
});
