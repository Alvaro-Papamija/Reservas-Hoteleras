package com.hotelalborada.backend.controller;

import com.hotelalborada.backend.model.TipoHabitacion;
import com.hotelalborada.backend.repository.TipoHabitacionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Tipos de Habitación", description = "Catálogo maestro de categorías de suites y habitaciones")
@RestController
@RequestMapping("/api/tipos-habitacion")
public class TipoHabitacionController {

    private final TipoHabitacionRepository tipoHabitacionRepository;

    public TipoHabitacionController(TipoHabitacionRepository tipoHabitacionRepository) {
        this.tipoHabitacionRepository = tipoHabitacionRepository;
    }

    @Operation(summary = "Listar todos los tipos de habitación", description = "Retorna el catálogo con capacidades y precios base de referencia.")
    @GetMapping
    public ResponseEntity<List<TipoHabitacion>> listarTipos() {
        return ResponseEntity.ok(tipoHabitacionRepository.findAll());
    }
}
