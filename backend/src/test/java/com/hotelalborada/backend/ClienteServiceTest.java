package com.hotelalborada.backend;

import com.hotelalborada.backend.dto.ClienteDTOs.*;
import com.hotelalborada.backend.model.Cliente;
import com.hotelalborada.backend.repository.ClienteRepository;
import com.hotelalborada.backend.service.ClienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    private ClienteService clienteService;

    @BeforeEach
    void setUp() {
        clienteService = new ClienteService(clienteRepository);
    }

    @Test
    @DisplayName("Registrar Cliente Walk-in Exitoso")
    void testRegistrarClienteExito() {
        when(clienteRepository.existsByDocumento("1098765432")).thenReturn(false);
        when(clienteRepository.save(any(Cliente.class))).thenAnswer(i -> {
            Cliente c = i.getArgument(0);
            c.setIdCliente(10L);
            return c;
        });

        ClienteRequest req = new ClienteRequest();
        req.setNombre("Mario");
        req.setApellido("Duque");
        req.setDocumento("1098765432");
        req.setTelefono("+57 310 111 2233");
        req.setCorreo("mario.duque@ejemplo.com");

        ClienteResponse res = clienteService.registrar(req);

        assertNotNull(res);
        assertEquals(10L, res.getIdCliente());
        assertEquals("Mario", res.getNombre());
        assertEquals("1098765432", res.getDocumento());
    }

    @Test
    @DisplayName("Rechazar duplicado de documento de cliente")
    void testRegistrarClienteDuplicadoRechaza() {
        when(clienteRepository.existsByDocumento("1098765432")).thenReturn(true);

        ClienteRequest req = new ClienteRequest();
        req.setNombre("Mario");
        req.setApellido("Duque");
        req.setDocumento("1098765432");
        req.setTelefono("+57 310 111 2233");
        req.setCorreo("mario.duque@ejemplo.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> clienteService.registrar(req));
        assertTrue(ex.getMessage().contains("Ya existe un cliente registrado"));
    }
}
