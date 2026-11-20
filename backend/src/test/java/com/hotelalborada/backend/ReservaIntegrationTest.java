package com.hotelalborada.backend;

import com.hotelalborada.backend.controller.PagoController;
import com.hotelalborada.backend.controller.ReservaController;
import com.hotelalborada.backend.dto.PagoDTOs.PagoResponse;
import com.hotelalborada.backend.dto.PagoDTOs.RegistrarPagoRequest;
import com.hotelalborada.backend.dto.ReservaDTOs.*;
import com.hotelalborada.backend.service.PagoService;
import com.hotelalborada.backend.service.ReservaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaIntegrationTest {

    @Mock
    private ReservaService reservaService;

    @Mock
    private PagoService pagoService;

    @InjectMocks
    private ReservaController reservaController;

    @InjectMocks
    private PagoController pagoController;

    @Test
    @DisplayName("Integración Reserva: Creación exitosa retorna HTTP 201 Created con DTO")
    void testCrearReservaEndpoint() {
        CrearReservaRequest request = new CrearReservaRequest();
        request.setIdHabitacion(1L);
        request.setIdCliente(1L);
        request.setFechaEntrada(LocalDate.of(2026, 12, 15));
        request.setFechaSalida(LocalDate.of(2026, 12, 18));
        request.setCantidadHuespedes(2);
        request.setNotas("Llegada estimada 4 PM");
        request.setCuponCodigo("ALBORADA10");

        ReservaResponse mockResponse = new ReservaResponse();
        mockResponse.setIdReserva(10L);
        mockResponse.setCodigo("RH-20261215-4433");
        mockResponse.setIdCliente(1L);
        mockResponse.setClienteNombre("Laura Gómez");
        mockResponse.setClienteDocumento("1085294821");
        mockResponse.setClienteCorreo("laura@ejemplo.com");
        mockResponse.setIdHabitacion(1L);
        mockResponse.setHabitacionNumero("102");
        mockResponse.setHabitacionTipo("Doble");
        mockResponse.setFechaEntrada(LocalDate.of(2026, 12, 15));
        mockResponse.setFechaSalida(LocalDate.of(2026, 12, 18));
        mockResponse.setCantidadHuespedes(2);
        mockResponse.setPrecioNoche(180000.0);
        mockResponse.setCantidadNoches(3);
        mockResponse.setSubtotal(540000.0);
        mockResponse.setDescuento(54000.0);
        mockResponse.setTotal(486000.0);
        mockResponse.setSaldo(486000.0);
        mockResponse.setCuponAplicado("ALBORADA10");
        mockResponse.setEstado("PENDIENTE");
        mockResponse.setFechaCreacion(LocalDateTime.now());
        mockResponse.setNotas("Llegada estimada 4 PM");

        when(reservaService.crear(any(CrearReservaRequest.class))).thenReturn(mockResponse);

        ResponseEntity<ReservaResponse> response = reservaController.crearReserva(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("RH-20261215-4433", response.getBody().getCodigo());
        assertEquals(486000.0, response.getBody().getTotal());
        verify(reservaService, times(1)).crear(any(CrearReservaRequest.class));
    }

    @Test
    @DisplayName("Integración Check-In: Asigna llave física y actualiza estado a CHECK_IN")
    void testCheckInEndpoint() {
        CheckInRequest request = new CheckInRequest();
        request.setNumeroLlave("LLAVE-102");

        ReservaResponse mockResponse = new ReservaResponse();
        mockResponse.setIdReserva(10L);
        mockResponse.setCodigo("RH-20261215-4433");
        mockResponse.setEstado("CHECK_IN");
        mockResponse.setNumeroLlave("LLAVE-102");
        mockResponse.setFechaCheckin(LocalDateTime.now());

        when(reservaService.registrarCheckIn(eq(10L), any(CheckInRequest.class))).thenReturn(mockResponse);

        ResponseEntity<ReservaResponse> response = reservaController.registrarCheckIn(10L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("CHECK_IN", response.getBody().getEstado());
        assertEquals("LLAVE-102", response.getBody().getNumeroLlave());
    }

    @Test
    @DisplayName("Integración Cancelación: Registra motivo y actualiza estado a CANCELADA")
    void testCancelarReservaEndpoint() {
        CancelarReservaRequest request = new CancelarReservaRequest();
        request.setMotivoCancelacion("Cambio de itinerario de vuelo");

        ReservaResponse mockResponse = new ReservaResponse();
        mockResponse.setIdReserva(10L);
        mockResponse.setCodigo("RH-20261215-4433");
        mockResponse.setEstado("CANCELADA");

        when(reservaService.cancelar(eq(10L), any(CancelarReservaRequest.class))).thenReturn(mockResponse);

        ResponseEntity<ReservaResponse> response = reservaController.cancelarReserva(10L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("CANCELADA", response.getBody().getEstado());
    }

    @Test
    @DisplayName("Integración Pago: Registro de pago retorna HTTP 201 Created con recibo de caja")
    void testRegistrarPagoEndpoint() {
        RegistrarPagoRequest request = new RegistrarPagoRequest(10L, 486000.0, "TARJETA");

        PagoResponse mockResponse = new PagoResponse(
                1L,
                10L,
                486000.0,
                "TARJETA",
                "RC-20261120-7711",
                "Recepción",
                LocalDateTime.now()
        );

        when(pagoService.registrarPago(any(RegistrarPagoRequest.class), anyString())).thenReturn(mockResponse);

        ResponseEntity<PagoResponse> response = pagoController.registrarPago(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("RC-20261120-7711", response.getBody().getReciboCaja());
        assertEquals(486000.0, response.getBody().getMonto());
    }
}
