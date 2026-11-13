import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../utils/authService';

describe('Módulo de Autenticación & Seguridad OWASP', () => {
  beforeEach(() => {
    AuthService.clearAllForTesting();
    vi.restoreAllMocks();
  });

  describe('Validación de Campos en el Cliente', () => {
    it('debe rechazar correos vacíos o con formato inválido', () => {
      expect(AuthService.validateEmail('').valid).toBe(false);
      expect(AuthService.validateEmail('   ').valid).toBe(false);
      expect(AuthService.validateEmail('sin-arroba').valid).toBe(false);
      expect(AuthService.validateEmail('correo@sin-dominio').valid).toBe(false);
      expect(AuthService.validateEmail('@dominio.com').valid).toBe(false);
    });

    it('debe aceptar correos con formato RFC 5322 válido', () => {
      expect(AuthService.validateEmail('usuario@hotelalborada.com').valid).toBe(true);
      expect(AuthService.validateEmail('laura.gomez@ejemplo.com').valid).toBe(true);
      expect(AuthService.validateEmail('cliente+tag@sub.dominio.co').valid).toBe(true);
    });

    it('debe validar que la contraseña no sea vacía y cumpla mínimo 6 caracteres', () => {
      expect(AuthService.validatePassword('').valid).toBe(false);
      expect(AuthService.validatePassword('12345').valid).toBe(false);
      expect(AuthService.validatePassword('123456').valid).toBe(true);
      expect(AuthService.validatePassword('Admin123*').valid).toBe(true);
    });

    it('debe validar que el nombre en registro tenga al menos 2 caracteres', () => {
      expect(AuthService.validateName('').valid).toBe(false);
      expect(AuthService.validateName('A').valid).toBe(false);
      expect(AuthService.validateName('Alvaro Papamija').valid).toBe(true);
    });
  });

  describe('Verificación de Credenciales & Mensaje Genérico OWASP', () => {
    it('debe iniciar sesión con éxito si las credenciales son correctas y generar token', async () => {
      const res = await AuthService.login('alvaro@hotelalborada.com', 'Admin123*');
      expect(res.success).toBe(true);
      expect(res.user?.rol).toBe('ADMINISTRADOR');
      expect(res.token).toBeDefined();
      expect(AuthService.getToken()).toBeDefined();
    });

    it('debe retornar mensaje de error genérico cuando la contraseña es incorrecta', async () => {
      const res = await AuthService.login('alvaro@hotelalborada.com', 'PasswordIncorrecta999*');
      expect(res.success).toBe(false);
      // OWASP ASVS: El mensaje nunca debe decir "la contraseña es incorrecta"
      expect(res.error).toBe('Correo o contraseña incorrectos');
    });

    it('debe retornar exactamente el mismo mensaje genérico cuando el usuario no existe', async () => {
      const res = await AuthService.login('noexiste@hotelalborada.com', 'CualquierPassword123*');
      expect(res.success).toBe(false);
      // OWASP Anti-Enumeración: Mismo mensaje para evitar saber si el correo existe
      expect(res.error).toBe('Correo o contraseña incorrectos');
    });
  });

  describe('Mitigación de Ataques de Fuerza Bruta (Rate Limiting)', () => {
    it('debe bloquear temporalmente tras 5 intentos fallidos consecutivos', async () => {
      // 4 intentos fallidos: aún no bloqueado
      for (let i = 0; i < 4; i++) {
        const res = await AuthService.login('atacante@ejemplo.com', 'intento_fallido');
        expect(res.success).toBe(false);
        expect(res.isRateLimited).toBeFalsy();
      }

      // 5to intento fallido: activa el bloqueo
      const quintoIntento = await AuthService.login('atacante@ejemplo.com', 'intento_fallido');
      expect(quintoIntento.success).toBe(false);
      expect(quintoIntento.isRateLimited).toBe(true);
      expect(quintoIntento.retryAfterSeconds).toBeGreaterThan(0);

      // Siguiente intento debe ser rechazado inmediatamente por bloqueo activo
      const rateLimitCheck = AuthService.checkRateLimit();
      expect(rateLimitCheck.isBlocked).toBe(true);
    });

    it('debe restablecer el contador de intentos fallidos al iniciar sesión exitosamente', async () => {
      // 2 intentos fallidos
      await AuthService.login('alvaro@hotelalborada.com', 'error1');
      await AuthService.login('alvaro@hotelalborada.com', 'error2');

      // Login exitoso
      const exito = await AuthService.login('alvaro@hotelalborada.com', 'Admin123*');
      expect(exito.success).toBe(true);

      const rateLimitCheck = AuthService.checkRateLimit();
      expect(rateLimitCheck.isBlocked).toBe(false);
    });
  });

  describe('Cierre de Sesión Seguro (Logout)', () => {
    it('debe invalidar y remover el token del almacenamiento al hacer logout', async () => {
      await AuthService.login('laura.gomez@ejemplo.com', 'Cliente123*');
      expect(AuthService.getToken()).toBeDefined();

      await AuthService.logout();
      expect(AuthService.getToken()).toBeNull();
    });
  });

  describe('Registro Seguro de Nuevos Usuarios', () => {
    it('debe registrar un nuevo usuario con éxito y retornar sesión activa', async () => {
      const res = await AuthService.register('Nuevo Huésped', 'nuevo.huesped@ejemplo.com', 'ClaveSegura123*');
      expect(res.success).toBe(true);
      expect(res.user?.nombre).toBe('Nuevo Huésped');
      expect(res.user?.correo).toBe('nuevo.huesped@ejemplo.com');
      expect(res.token).toBeDefined();
    });
  });
});
