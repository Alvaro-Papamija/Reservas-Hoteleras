package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.dto.ClienteDTOs.*;
import com.hotelalborada.backend.service.ClienteService;
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

@Tag(name = "Clientes", description = "Operaciones CRUD para la ficha de huéspedes y clientes del hotel")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @Operation(summary = "Registrar nuevo huésped (CRUD - Create)", description = "Da de alta la ficha de un cliente o huésped walk-in con validación de documento único.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cliente registrado con éxito"),
            @ApiResponse(responseCode = "400", description = "Documento ya registrado o datos inválidos")
    })
    @PostMapping
    public ResponseEntity<ClienteResponse> registrar(@Valid @RequestBody ClienteRequest request) {
        ClienteResponse creado = clienteService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @Operation(summary = "Listar todos los clientes (CRUD - Read)", description = "Retorna el directorio completo de clientes registrados.")
    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @Operation(summary = "Buscar cliente por ID", description = "Consulta la ficha de un cliente por su clave primaria.")
    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@Parameter(description = "ID del cliente") @PathVariable Long id) {
        return clienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Buscar cliente por documento", description = "Permite a recepción ubicar a un cliente por su cédula, pasaporte o NIT.")
    @GetMapping("/documento/{documento}")
    public ResponseEntity<ClienteResponse> buscarPorDocumento(@Parameter(description = "Número de documento de identidad") @PathVariable String documento) {
        return clienteService.buscarPorDocumento(documento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Actualizar datos del cliente (CRUD - Update)", description = "Permite modificar el teléfono, correo o dirección de un cliente.")
    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequest request) {
        ClienteResponse actualizado = clienteService.actualizar(id, request);
        return ResponseEntity.ok(actualizado);
    }
}
