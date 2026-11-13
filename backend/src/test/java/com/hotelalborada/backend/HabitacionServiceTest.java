package com.hotelalborada.backend;

import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.repository.HabitacionRepository;
import com.hotelalborada.backend.repository.HabitacionResumen;
import com.hotelalborada.backend.service.HabitacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HabitacionServiceTest {

    @Mock
    private HabitacionRepository habitacionRepository;

    @InjectMocks
    private HabitacionService habitacionService;

    private Habitacion habitacionMuestra;

    @BeforeEach
    void setUp() {
        habitacionMuestra = new Habitacion("101", 1, "Individual", 120000.0, "DISPONIBLE", true);
        habitacionMuestra.setId(1L);
    }

    @Test
    @DisplayName("Debe listar todas las habitaciones delegando en el repositorio JPA")
    void testListarTodas() {
        when(habitacionRepository.findAll()).thenReturn(List.of(habitacionMuestra));

        List<Habitacion> resultado = habitacionService.listarTodas();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("101", resultado.get(0).getNumero());
        verify(habitacionRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar una habitación por ID exitosamente")
    void testBuscarPorId() {
        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(habitacionMuestra));

        Optional<Habitacion> resultado = habitacionService.buscarPorId(1L);

        assertTrue(resultado.isPresent());
        assertEquals(1L, resultado.get().getId());
        assertEquals("Individual", resultado.get().getTipo());
        verify(habitacionRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Debe guardar una nueva habitación persistiendo a través de JPA")
    void testGuardarHabitacion() {
        when(habitacionRepository.save(any(Habitacion.class))).thenReturn(habitacionMuestra);

        Habitacion guardada = habitacionService.guardar(habitacionMuestra);

        assertNotNull(guardada);
        assertEquals("101", guardada.getNumero());
        assertEquals(120000.0, guardada.getPrecioBase());
        verify(habitacionRepository, times(1)).save(habitacionMuestra);
    }

    @Test
    @DisplayName("Debe listar habitaciones de forma paginada")
    void testListarPaginadas() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Habitacion> page = new PageImpl<>(List.of(habitacionMuestra), pageable, 1);
        when(habitacionRepository.findAll(pageable)).thenReturn(page);

        Page<Habitacion> resultado = habitacionService.listarPaginadas(pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(1, resultado.getContent().size());
        verify(habitacionRepository, times(1)).findAll(pageable);
    }
}


