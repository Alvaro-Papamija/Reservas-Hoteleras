package com.hotelalborada.backend;

import com.hotelalborada.backend.dto.ReservaDTOs.*;
import com.hotelalborada.backend.model.Cliente;
import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.model.Reserva;
import com.hotelalborada.backend.repository.ClienteRepository;
import com.hotelalborada.backend.repository.CuponRepository;
import com.hotelalborada.backend.repository.HabitacionRepository;
import com.hotelalborada.backend.repository.ReservaRepository;
import com.hotelalborada.backend.service.ReservaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private HabitacionRepository habitacionRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private CuponRepository cuponRepository;

    private ReservaService reservaService;

    @BeforeEach
    void setUp() {
        reservaService = new ReservaService(reservaRepository, habitacionRepository, clienteRepository, cuponRepository);
    }

    @Test
    @DisplayName("Crear Reserva Exitosa: Calcula noches, total y genera código")
    void testCrearReservaExito() {
        Habitacion hab = new Habitacion(1L, "102", 1, "Doble", 180000.0, "DISPONIBLE", true);
        Cliente cliente = new Cliente(1L, 3L, "Laura", "Gómez", "CC", "1085294821", "+57 312 458 9012", "laura@ejemplo.com", "Bogotá");

        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(hab));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(reservaRepository.findSolapadas(any(), any(), any(), any())).thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> {
            Reserva r = i.getArgument(0);
            r.setIdReserva(10L);
            return r;
        });

        CrearReservaRequest req = new CrearReservaRequest();
        req.setIdHabitacion(1L);
        req.setIdCliente(1L);
        req.setFechaEntrada(LocalDate.of(2026, 12, 15));
        req.setFechaSalida(LocalDate.of(2026, 12, 18));
        req.setCantidadHuespedes(2);

        ReservaResponse res = reservaService.crear(req);

        assertNotNull(res);
        assertEquals(3, res.getCantidadNoches());
        assertEquals(540000.0, res.getTotal());
        assertTrue(res.getCodigo().startsWith("RH-20261215-"));
        assertEquals("CONFIRMADA", res.getEstado());
    }

    @Test
    @DisplayName("Mitigación de Overbooking: Rechaza reserva si existe solapamiento en las fechas")
    void testCrearReservaRechazaSolapamiento() {
        Habitacion hab = new Habitacion(1L, "102", 1, "Doble", 180000.0, "DISPONIBLE", true);
        Cliente cliente = new Cliente(1L, 3L, "Laura", "Gómez", "CC", "1085294821", "+57 312 458 9012", "laura@ejemplo.com", "Bogotá");

        Reserva reservaExistente = new Reserva();
        reservaExistente.setIdReserva(5L);
        reservaExistente.setEstado("CONFIRMADA");

        when(habitacionRepository.findById(1L)).thenReturn(Optional.of(hab));
        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(reservaRepository.findSolapadas(any(), any(), any(), any())).thenReturn(List.of(reservaExistente));

        CrearReservaRequest req = new CrearReservaRequest();
        req.setIdHabitacion(1L);
        req.setIdCliente(1L);
        req.setFechaEntrada(LocalDate.of(2026, 12, 15));
        req.setFechaSalida(LocalDate.of(2026, 12, 18));
        req.setCantidadHuespedes(2);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> reservaService.crear(req));
        assertTrue(ex.getMessage().contains("ya tiene una reserva activa"));
    }

    @Test
    @DisplayName("Check-In: Asigna llave física y actualiza estado de reserva")
    void testCheckInExitoso() {
        Reserva reserva = new Reserva();
        reserva.setIdReserva(1L);
        reserva.setIdHabitacion(2L);
        reserva.setEstado("CONFIRMADA");

        Habitacion hab = new Habitacion(2L, "104", 1, "Doble", 180000.0, "DISPONIBLE", true);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(habitacionRepository.findById(2L)).thenReturn(Optional.of(hab));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));

        CheckInRequest req = new CheckInRequest();
        req.setNumeroLlave("LLAVE-104");

        ReservaResponse res = reservaService.registrarCheckIn(1L, req);

        assertNotNull(res);
        assertEquals("CHECK_IN", res.getEstado());
        assertEquals("LLAVE-104", res.getNumeroLlave());
        assertNotNull(res.getFechaCheckin());
    }

    @Test
    @DisplayName("Cancelación: Pasa estado a CANCELADA y registra motivo")
    void testCancelarReserva() {
        Reserva reserva = new Reserva();
        reserva.setIdReserva(1L);
        reserva.setIdHabitacion(2L);
        reserva.setEstado("CONFIRMADA");

        Habitacion hab = new Habitacion(2L, "104", 1, "Doble", 180000.0, "RESERVADA", true);

        when(reservaRepository.findById(1L)).thenReturn(Optional.of(reserva));
        when(habitacionRepository.findById(2L)).thenReturn(Optional.of(hab));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(i -> i.getArgument(0));

        CancelarReservaRequest req = new CancelarReservaRequest();
        req.setMotivoCancelacion("Emergencia personal");

        ReservaResponse res = reservaService.cancelar(1L, req);

        assertNotNull(res);
        assertEquals("CANCELADA", res.getEstado());
        verify(habitacionRepository).save(argThat(h -> "DISPONIBLE".equals(h.getEstado())));
    }
}
