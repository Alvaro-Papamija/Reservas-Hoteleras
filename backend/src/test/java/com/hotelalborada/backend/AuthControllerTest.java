package com.hotelalborada.backend;

import com.hotelalborada.backend.dto.AuthDTOs.*;
import com.hotelalborada.backend.model.Usuario;
import com.hotelalborada.backend.repository.UsuarioRepository;
import com.hotelalborada.backend.security.JwtService;
import com.hotelalborada.backend.security.LoginAttemptService;
import com.hotelalborada.backend.security.TokenRevocationService;
import com.hotelalborada.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    private PasswordEncoder passwordEncoder;
    private TokenRevocationService tokenRevocationService;
    private JwtService jwtService;
    private LoginAttemptService loginAttemptService;
    private AuthService authService;

    private final String rawPassword = "PasswordSegura123*";
    private String hashedPassword;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(10);
        hashedPassword = passwordEncoder.encode(rawPassword);

        tokenRevocationService = new TokenRevocationService();
        jwtService = new JwtService("SecretKeyPruebasUnitariasHotelAlborada2026SuficienteLongitudParaHMACSHA256", 3600000, tokenRevocationService);
        loginAttemptService = new LoginAttemptService(5, 15);
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService, tokenRevocationService, loginAttemptService);
    }

    @Test
    @DisplayName("Caso Exitoso: Login con credenciales correctas retorna token JWT válido y datos de usuario")
    void testLoginExitoso() {
        Usuario usuario = new Usuario(1L, "Laura Gómez", "laura@ejemplo.com", hashedPassword, "CLIENTE", true);
        when(usuarioRepository.findByCorreoIgnoreCase("laura@ejemplo.com")).thenReturn(Optional.of(usuario));

        LoginRequest request = new LoginRequest("laura@ejemplo.com", rawPassword);
        AuthResponse response = authService.login(request, "192.168.1.100");

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(jwtService.validateToken(response.getToken()));
        assertEquals("laura@ejemplo.com", jwtService.extractCorreo(response.getToken()));
        assertEquals("CLIENTE", response.getUsuario().getRol());
    }

    @Test
    @DisplayName("Credenciales Incorrectas: Contraseña equivocada lanza BadCredentialsException con mensaje genérico")
    void testLoginContrasenaIncorrecta() {
        Usuario usuario = new Usuario(1L, "Laura Gómez", "laura@ejemplo.com", hashedPassword, "CLIENTE", true);
        when(usuarioRepository.findByCorreoIgnoreCase("laura@ejemplo.com")).thenReturn(Optional.of(usuario));

        LoginRequest request = new LoginRequest("laura@ejemplo.com", "PasswordErronea999*");

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "192.168.1.100");
        });

        assertEquals("Correo o contraseña incorrectos", ex.getMessage());
    }

    @Test
    @DisplayName("OWASP Anti-Enumeración: Correo inexistente lanza exactamente la misma excepción genérica")
    void testLoginUsuarioInexistente() {
        when(usuarioRepository.findByCorreoIgnoreCase("noexiste@ejemplo.com")).thenReturn(Optional.empty());

        LoginRequest request = new LoginRequest("noexiste@ejemplo.com", "CualquierPassword123*");

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () -> {
            authService.login(request, "192.168.1.100");
        });

        // Verificamos que el mensaje es idéntico para no filtrar si el usuario existe
        assertEquals("Correo o contraseña incorrectos", ex.getMessage());
    }

    @Test
    @DisplayName("Mitigación de Fuerza Bruta: Exceder intentos fallidos activa bloqueo temporal (Rate Limiting)")
    void testMitigacionFuerzaBruta() {
        when(usuarioRepository.findByCorreoIgnoreCase(any())).thenReturn(Optional.empty());

        String ip = "10.0.0.50";
        LoginRequest request = new LoginRequest("atacante@ejemplo.com", "clave_falsa");

        // Realizar 5 intentos fallidos para alcanzar el límite
        for (int i = 0; i < 5; i++) {
            assertThrows(BadCredentialsException.class, () -> authService.login(request, ip));
        }

        // El 6to intento debe ser bloqueado directamente por tasa de intentos
        AuthService.RateLimitException rateLimitEx = assertThrows(AuthService.RateLimitException.class, () -> {
            authService.login(request, ip);
        });

        assertTrue(rateLimitEx.getMessage().contains("Demasiados intentos fallidos"));
        assertTrue(rateLimitEx.getRetryAfterSeconds() > 0);
    }

    @Test
    @DisplayName("Cierre de Sesión: Logout revoca el token JWT en el servidor")
    void testLogoutRevocaToken() {
        String token = jwtService.generateToken(1L, "usuario@test.com", "CLIENTE");
        assertTrue(jwtService.validateToken(token), "El token recién emitido debe ser válido");

        authService.logout("Bearer " + token);

        assertFalse(jwtService.validateToken(token), "El token revocado no debe ser aceptado por el servidor");
    }

    @Test
    @DisplayName("Registro Seguro: Almacena contraseña cifrada con BCrypt y nunca en texto plano")
    void testRegistroNuevoUsuario() {
        when(usuarioRepository.existsByCorreoIgnoreCase("nuevo@ejemplo.com")).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setIdUsuario(10L);
            return u;
        });

        RegistroRequest request = new RegistroRequest("Carlos Nuevo", "nuevo@ejemplo.com", "PasswordSegura789*", "CLIENTE");
        AuthResponse response = authService.registrar(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        verify(usuarioRepository).save(argThat(u ->
                !u.getContrasena().equals("PasswordSegura789*") && // No debe ser texto plano
                u.getContrasena().startsWith("$2a$") &&            // Debe ser hash BCrypt
                passwordEncoder.matches("PasswordSegura789*", u.getContrasena())
        ));
    }
}
