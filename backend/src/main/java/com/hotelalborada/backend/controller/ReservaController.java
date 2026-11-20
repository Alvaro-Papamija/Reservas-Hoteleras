package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.dto.ReservaDTOs.*;
import com.hotelalborada.backend.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Reservas", description = "Operaciones CRUD completas para gestión de reservas, fechas, check-in y cancelaciones")
@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @Operation(summary = "Crear nueva reserva (CRUD - Create)", description = "Registra una reserva calculando automáticamente noches, subtotal, cupón de descuento y saldo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Reserva creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Fechas inválidas o datos erróneos"),
            @ApiResponse(responseCode = "409", description = "Conflicto por solapamiento de fechas en la habitación")
    })
    @PostMapping
    public ResponseEntity<ReservaResponse> crearReserva(@Valid @RequestBody CrearReservaRequest request) {
        ReservaResponse creada = reservaService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @Operation(summary = "Listar todas las reservas (CRUD - Read)", description = "Retorna el historial completo de expedientes de reservas.")
    @GetMapping
    public ResponseEntity<List<ReservaResponse>> listarTodas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }

    @Operation(summary = "Consultar reserva por ID", description = "Retorna el expediente de una reserva por su identificador primario.")
    @GetMapping("/{id}")
    public ResponseEntity<ReservaResponse> obtenerPorId(@Parameter(description = "ID único de la reserva") @PathVariable Long id) {
        return reservaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Consultar reserva por código oficial", description = "Permite a clientes y recepcionistas consultar el estado de la reserva por su código (ej: RH-20261215-0042).")
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ReservaResponse> obtenerPorCodigo(@Parameter(description = "Código de voucher oficial") @PathVariable String codigo) {
        return reservaService.buscarPorCodigo(codigo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Listar reservas por cliente", description = "Consulta todas las reservas pertenecientes a un cliente específico.")
    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<ReservaResponse>> listarPorCliente(@PathVariable Long idCliente) {
        return ResponseEntity.ok(reservaService.listarPorCliente(idCliente));
    }

    @Operation(summary = "Modificar fechas de estancia (CRUD - Update)", description = "Reprograma las fechas de entrada y salida recalculando noches y saldo, validando que no haya solapamiento.")
    @PutMapping("/{id}/fechas")
    public ResponseEntity<ReservaResponse> modificarFechas(
            @PathVariable Long id,
            @Valid @RequestBody ModificarFechasRequest request) {
        ReservaResponse actualizada = reservaService.modificarFechas(id, request);
        return ResponseEntity.ok(actualizada);
    }

    @Operation(summary = "Registrar Check-In y entrega de llave física (CRUD - Update)", description = "Confirma la llegada del huésped, asigna el código de la llave física y cambia el estado a CHECK_IN.")
    @PatchMapping("/{id}/checkin")
    public ResponseEntity<ReservaResponse> registrarCheckIn(
            @PathVariable Long id,
            @Valid @RequestBody CheckInRequest request) {
        ReservaResponse actualizada = reservaService.registrarCheckIn(id, request);
        return ResponseEntity.ok(actualizada);
    }

    @Operation(summary = "Cancelar reserva (CRUD - Delete Lógico)", description = "Anula una reserva registrando el motivo legal de cancelación y liberando el inventario de la habitación.")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ReservaResponse> cancelarReserva(
            @PathVariable Long id,
            @Valid @RequestBody CancelarReservaRequest request) {
        ReservaResponse cancelada = reservaService.cancelar(id, request);
        return ResponseEntity.ok(cancelada);
    }
}
