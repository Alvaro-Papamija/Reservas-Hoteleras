package com.hotelalborada.backend.service;

import com.hotelalborada.backend.dto.AuthDTOs.*;
import com.hotelalborada.backend.model.Usuario;
import com.hotelalborada.backend.repository.UsuarioRepository;
import com.hotelalborada.backend.security.JwtService;
import com.hotelalborada.backend.security.LoginAttemptService;
import com.hotelalborada.backend.security.TokenRevocationService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Servicio de lógica de negocio para autenticación, registro y cierre de sesión seguro.
 * Aplica OWASP ASVS v4.0:
 * - Hashing BCrypt resistente (nunca texto plano).
 * - Mensajes de error unificados contra enumeración de usuarios.
 * - Mitigación de fuerza bruta con bloqueo temporal por tasa de fallos.
 */
@Service
public class AuthService {

    public static class RateLimitException extends RuntimeException {
        private final long retryAfterSeconds;

        public RateLimitException(String message, long retryAfterSeconds) {
            super(message);
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public long getRetryAfterSeconds() {
            return retryAfterSeconds;
        }
    }

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRevocationService tokenRevocationService;
    private final LoginAttemptService loginAttemptService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenRevocationService tokenRevocationService,
            LoginAttemptService loginAttemptService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRevocationService = tokenRevocationService;
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * Autenticación con verificación de credenciales y protección de fuerza bruta.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, String clientIp) {
        String correoNormalizado = request.getCorreo().toLowerCase().trim();

        // 1. Verificación de tasa de intentos (Rate limiting / lockout)
        if (loginAttemptService.isBlocked(clientIp) || loginAttemptService.isBlocked(correoNormalizado)) {
            long remainingSeconds = Math.max(
                    loginAttemptService.getRemainingLockoutSeconds(clientIp),
                    loginAttemptService.getRemainingLockoutSeconds(correoNormalizado)
            );
            throw new RateLimitException(
                    "Demasiados intentos fallidos. Por seguridad, su acceso ha sido bloqueado temporalmente.",
                    remainingSeconds > 0 ? remainingSeconds : 900
            );
        }

        // 2. Búsqueda de usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreoIgnoreCase(correoNormalizado);

        // 3. Verificación de contraseña mediante BCrypt
        // OWASP: Mantener el mismo tiempo de respuesta y error unificado tanto si el usuario existe como si no
        boolean passwordMatches = false;
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            passwordMatches = passwordEncoder.matches(request.getContrasena(), u.getContrasena());
        } else {
            // Mitigación de Timing Attacks: ejecutar hashing dummy si el usuario no existe
            passwordEncoder.matches("dummy_timing_password", "$2a$12$e80MvQkK6lZ.13F39z3n3.0c48eK59L7/0b6Qy5u8u1u6o2z2i.t.");
        }

        if (!passwordMatches || usuarioOpt.isEmpty() || !Boolean.TRUE.equals(usuarioOpt.get().getEstado())) {
            loginAttemptService.loginFailed(clientIp);
            loginAttemptService.loginFailed(correoNormalizado);
            // Mensaje genérico para no revelar si el correo está registrado o si la contraseña es la incorrecta
            throw new BadCredentialsException("Correo o contraseña incorrectos");
        }

        // 4. Éxito: limpiar contadores de fallos y emitir token JWT
        loginAttemptService.loginSucceeded(clientIp);
        loginAttemptService.loginSucceeded(correoNormalizado);

        Usuario usuario = usuarioOpt.get();
        String token = jwtService.generateToken(usuario.getIdUsuario(), usuario.getCorreo(), usuario.getRol());

        UsuarioResponse usuarioResponse = new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol(),
                usuario.getEstado()
        );

        return new AuthResponse(token, jwtService.getExpirationMs(), usuarioResponse);
    }

    /**
     * Registro de nuevo usuario con contraseña cifrada en BCrypt.
     */
    @Transactional
    public AuthResponse registrar(RegistroRequest request) {
        String correoNormalizado = request.getCorreo().toLowerCase().trim();

        if (usuarioRepository.existsByCorreoIgnoreCase(correoNormalizado)) {
            throw new IllegalArgumentException("El correo electrónico ya se encuentra registrado.");
        }

        String rol = (request.getRol() != null && !request.getRol().isBlank())
                ? request.getRol().toUpperCase()
                : "CLIENTE";

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre().trim());
        nuevoUsuario.setCorreo(correoNormalizado);
        // Cifrado de contraseña con BCrypt (nunca en texto plano)
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getContrasena()));
        nuevoUsuario.setRol(rol);
        nuevoUsuario.setEstado(true);

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        String token = jwtService.generateToken(
                usuarioGuardado.getIdUsuario(),
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getRol()
        );

        UsuarioResponse usuarioResponse = new UsuarioResponse(
                usuarioGuardado.getIdUsuario(),
                usuarioGuardado.getNombre(),
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getRol(),
                usuarioGuardado.getEstado()
        );

        return new AuthResponse(token, jwtService.getExpirationMs(), usuarioResponse);
    }

    /**
     * Cierre de sesión que invalida el token JWT en el servidor.
     */
    public void logout(String rawToken) {
        if (rawToken != null) {
            String token = rawToken.startsWith("Bearer ") ? rawToken.substring(7).trim() : rawToken.trim();
            if (jwtService.validateToken(token)) {
                long expirationMs = jwtService.extractExpirationMs(token);
                tokenRevocationService.revokeToken(token, expirationMs);
            }
        }
    }

    /**
     * Obtiene los datos del usuario autenticado actual.
     */
    @Transactional(readOnly = true)
    public UsuarioResponse getUsuarioPorCorreo(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));

        return new UsuarioResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getRol(),
                usuario.getEstado()
        );
    }
}
