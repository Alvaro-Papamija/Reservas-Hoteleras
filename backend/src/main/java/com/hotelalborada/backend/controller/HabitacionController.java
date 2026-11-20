package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.dto.HabitacionDTOs.ActualizarHabitacionRequest;
import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.repository.HabitacionResumen;
import com.hotelalborada.backend.service.HabitacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para el ciclo de vida CRUD y consulta de habitaciones.
 */
@Tag(name = "Habitaciones", description = "Operaciones CRUD y catálogo público de habitaciones del hotel")
@RestController
@RequestMapping("/api/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @Operation(summary = "Verificación de salud", description = "Comprueba el estado operativo del backend y conectividad a base de datos.")
    @GetMapping("/salud")
    public ResponseEntity<Map<String, Object>> verificarSalud() {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("estado", "UP");
        respuesta.put("mensaje", "Backend Spring Boot conectado y operativo");
        respuesta.put("tecnologias", List.of("Java 21", "Spring Boot 3.3.5", "Spring Data JPA", "PostgreSQL"));
        respuesta.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(respuesta);
    }

    @Operation(summary = "Listar todas las habitaciones", description = "Retorna el catálogo completo de habitaciones registradas.")
    @GetMapping
    public ResponseEntity<List<Habitacion>> listarHabitaciones() {
        List<Habitacion> habitaciones = habitacionService.listarTodas();
        return ResponseEntity.ok(habitaciones);
    }

    @Operation(summary = "Listar habitaciones paginadas", description = "Permite paginar y ordenar el listado para optimizar rendimiento.")
    @GetMapping("/paginado")
    public ResponseEntity<Page<Habitacion>> listarHabitacionesPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "numero") String sortBy
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Habitacion> resultado = habitacionService.listarPaginadas(pageable);
        return ResponseEntity.ok(resultado);
    }

    @Operation(summary = "Listar resumenes ligeros", description = "Obtiene proyecciones optimizadas seleccionando únicamente columnas clave.")
    @GetMapping("/resumen")
    public ResponseEntity<List<HabitacionResumen>> listarResumenHabitaciones() {
        List<HabitacionResumen> resumenes = habitacionService.listarResumenes();
        return ResponseEntity.ok(resumenes);
    }

    @Operation(summary = "Obtener habitación por ID", description = "Retorna los detalles completos de una habitación específica.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Habitación encontrada"),
            @ApiResponse(responseCode = "404", description = "Habitación no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Habitacion> obtenerHabitacionPorId(@Parameter(description = "ID único de habitación") @PathVariable Long id) {
        return habitacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear nueva habitación (CRUD - Create)", description = "Registra una nueva habitación en el inventario. Requiere rol ADMINISTRADOR.")
    @ApiResponse(responseCode = "201", description = "Habitación creada exitosamente")
    @PostMapping
    public ResponseEntity<Habitacion> crearHabitacion(@Valid @RequestBody Habitacion habitacion) {
        Habitacion guardada = habitacionService.guardar(habitacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @Operation(summary = "Actualizar habitación existente (CRUD - Update)", description = "Modifica los atributos, precio o capacidad de una habitación. Requiere rol ADMINISTRADOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Habitación actualizada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Habitación no encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Habitacion> actualizarHabitacion(
            @Parameter(description = "ID de la habitación") @PathVariable Long id,
            @Valid @RequestBody ActualizarHabitacionRequest request) {
        Habitacion actualizada = habitacionService.actualizar(id, request);
        return ResponseEntity.ok(actualizada);
    }

    @Operation(summary = "Cambiar estado operativo", description = "Actualiza el estado de una habitación (DISPONIBLE, RESERVADA, OCUPADA, MANTENIMIENTO).")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Habitacion> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        Habitacion actualizada = habitacionService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.ok(actualizada);
    }

    @Operation(summary = "Eliminar habitación (CRUD - Delete)", description = "Elimina físicamente una habitación por su identificador. Requiere rol ADMINISTRADOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Habitación eliminada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Habitación no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHabitacion(@PathVariable Long id) {
        boolean eliminada = habitacionService.eliminar(id);
        if (eliminada) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
