package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.service.HabitacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST que expone los endpoints HTTP para la gestión de habitaciones y verificación de conexión.
 */
@RestController
@RequestMapping("/api/habitaciones")
@CrossOrigin(origins = "*")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    /**
     * Endpoint de verificación de salud y conectividad de la arquitectura.
     * GET /api/habitaciones/salud
     */
    @GetMapping("/salud")
    public ResponseEntity<Map<String, Object>> verificarSalud() {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("estado", "UP");
        respuesta.put("mensaje", "Backend Spring Boot conectado y operativo");
        respuesta.put("tecnologias", List.of("Java 21", "Spring Boot 3.3.5", "Spring Data JPA", "PostgreSQL"));
        respuesta.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(respuesta);
    }

    /**
     * Obtiene todas las habitaciones persistidas en PostgreSQL.
     * GET /api/habitaciones
     */
    @GetMapping
    public ResponseEntity<List<Habitacion>> listarHabitaciones() {
        List<Habitacion> habitaciones = habitacionService.listarTodas();
        return ResponseEntity.ok(habitaciones);
    }

    /**
     * Obtiene una habitación por su ID.
     * GET /api/habitaciones/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Habitacion> obtenerHabitacionPorId(@PathVariable Long id) {
        return habitacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Registra una nueva habitación en PostgreSQL mediante Spring Data JPA.
     * POST /api/habitaciones
     */
    @PostMapping
    public ResponseEntity<Habitacion> crearHabitacion(@Valid @RequestBody Habitacion habitacion) {
        Habitacion guardada = habitacionService.guardar(habitacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    /**
     * Elimina una habitación por su identificador.
     * DELETE /api/habitaciones/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHabitacion(@PathVariable Long id) {
        boolean eliminada = habitacionService.eliminar(id);
        if (eliminada) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
