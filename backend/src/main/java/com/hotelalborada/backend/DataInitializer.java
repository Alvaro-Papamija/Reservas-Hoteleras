package com.hotelalborada.backend;

import com.hotelalborada.backend.model.Usuario;
import com.hotelalborada.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Semilla de inicialización de usuarios de prueba con contraseñas cifradas en BCrypt.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsuarioSiNoExiste("Alvaro Papamija", "alvaro@hotelalborada.com", "Admin123*", "ADMINISTRADOR");
        seedUsuarioSiNoExiste("Laura Gómez", "laura.gomez@ejemplo.com", "Cliente123*", "CLIENTE");
        seedUsuarioSiNoExiste("Carlos Restrepo", "carlos.restrepo@ejemplo.com", "Cliente123*", "CLIENTE");
    }

    private void seedUsuarioSiNoExiste(String nombre, String correo, String rawPassword, String rol) {
        if (!usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setCorreo(correo);
            u.setContrasena(passwordEncoder.encode(rawPassword));
            u.setRol(rol);
            u.setEstado(true);
            usuarioRepository.save(u);
            log.info("Usuario inicial sembrado con BCrypt: {} ({})", correo, rol);
        }
    }
}
