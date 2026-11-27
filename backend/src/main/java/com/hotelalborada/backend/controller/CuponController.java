package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.model.Cupon;
import com.hotelalborada.backend.repository.CuponRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Cupones", description = "Validación y aplicación de cupones de descuento y fidelidad")
@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    private final CuponRepository cuponRepository;

    public CuponController(CuponRepository cuponRepository) {
        this.cuponRepository = cuponRepository;
    }

    @Operation(summary = "Validar cupón de descuento", description = "Verifica si un código de cupón está activo y retorna sus condiciones de descuento.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cupón válido y activo"),
            @ApiResponse(responseCode = "404", description = "Cupón no encontrado, inactivo o vencido")
    })
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<Cupon> validarCupon(@Parameter(description = "Código de cupón comercial") @PathVariable String codigo) {
        return cuponRepository.findByCodigoIgnoreCaseAndActivoTrue(codigo.trim())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
