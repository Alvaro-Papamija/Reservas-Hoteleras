package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.dto.PagoDTOs.*;
import com.hotelalborada.backend.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Pagos", description = "Registro y liquidación de abonos en counter y recibos de caja")
@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @Operation(summary = "Registrar abono o liquidación de pago en counter (CRUD - Create)", description = "Genera un número único de recibo de caja y actualiza el saldo pendiente de la reserva.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pago registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Monto inválido o reserva inexistente")
    })
    @PostMapping
    public ResponseEntity<PagoResponse> registrarPago(@Valid @RequestBody RegistrarPagoRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String usuarioActual = (auth != null && auth.isAuthenticated()) ? (String) auth.getPrincipal() : "Recepción";

        PagoResponse creado = pagoService.registrarPago(request, usuarioActual);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "Listar pagos de una reserva", description = "Retorna el historial de abonos y recibos de caja asociados a una reserva.")
    @GetMapping("/reserva/{idReserva}")
    public ResponseEntity<List<PagoResponse>> listarPorReserva(@Parameter(description = "ID de la reserva") @PathVariable Long idReserva) {
        return ResponseEntity.ok(pagoService.listarPorReserva(idReserva));
    }
}
