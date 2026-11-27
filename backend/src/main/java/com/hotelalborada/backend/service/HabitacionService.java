package com.hotelalborada.backend.service;

import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.model.Reserva;
import com.hotelalborada.backend.repository.HabitacionRepository;
import com.hotelalborada.backend.repository.HabitacionResumen;
import com.hotelalborada.backend.repository.ReservaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Capa de Servicio empresarial que contiene la lógica de negocio y delimita las transacciones con PostgreSQL.
 */
@Service
@Transactional(readOnly = true)
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final ReservaRepository reservaRepository;

    public HabitacionService(HabitacionRepository habitacionRepository, ReservaRepository reservaRepository) {
        this.habitacionRepository = habitacionRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * Consulta habitaciones disponibles entre dos fechas, filtrando solapamientos y mantenimiento.
     */
    public List<Habitacion> listarDisponibles(LocalDate entrada, LocalDate salida, Integer capacidad) {
        List<Habitacion> activas = habitacionRepository.findByActivaTrue();
        if (entrada == null || salida == null) {
            return activas;
        }
        return activas.stream()
                .filter(h -> !"MANTENIMIENTO".equalsIgnoreCase(h.getEstado()))
                .filter(h -> {
                    List<Reserva> solapadas = reservaRepository.findSolapadas(h.getId(), entrada, salida, null);
                    return solapadas.isEmpty();
                })
                .toList();
    }

    /**
     * Obtiene el listado completo de habitaciones registradas en la base de datos.
     */
    public List<Habitacion> listarTodas() {
        return habitacionRepository.findAll();
    }

    /**
     * Obtiene habitaciones de manera paginada para reducir la carga de memoria y red.
     */
    public Page<Habitacion> listarPaginadas(Pageable pageable) {
        return habitacionRepository.findAll(pageable);
    }

    /**
     * Obtiene proyecciones ligeras solicitando únicamente columnas esenciales.
     */
    public List<HabitacionResumen> listarResumenes() {
        return habitacionRepository.findAllProjectedBy();
    }

    /**
     * Busca una habitación por su identificador primario.
     */
    public Optional<Habitacion> buscarPorId(Long id) {
        return habitacionRepository.findById(id);
    }

    /**
     * Busca una habitación por su número de puerta.
     */
    public Optional<Habitacion> buscarPorNumero(String numero) {
        return habitacionRepository.findByNumero(numero);
    }

    /**
     * Registra o actualiza una habitación dentro de una transacción de escritura.
     */
    @Transactional
    public Habitacion guardar(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    /**
     * Actualiza los atributos de una habitación existente (CRUD - Update).
     */
    @Transactional
    public Habitacion actualizar(Long id, com.hotelalborada.backend.dto.HabitacionDTOs.ActualizarHabitacionRequest request) {
        Habitacion hab = habitacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada con ID: " + id));

        hab.setTipo(request.getTipo());
        hab.setPrecioBase(request.getPrecioBase());
        hab.setEstado(request.getEstado().toUpperCase());
        hab.setPiso(request.getPiso());
        if (request.getActiva() != null) {
            hab.setActiva(request.getActiva());
        }
        if (request.getDescripcion() != null) {
            hab.setDescripcion(request.getDescripcion());
        }
        if (request.getImagen() != null) {
            hab.setImagen(request.getImagen());
        }

        return habitacionRepository.save(hab);
    }

    /**
     * Cambia el estado operativo de una habitación (DISPONIBLE, RESERVADA, OCUPADA, MANTENIMIENTO).
     */
    @Transactional
    public Habitacion cambiarEstado(Long id, String nuevoEstado) {
        Habitacion hab = habitacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada con ID: " + id));

        hab.setEstado(nuevoEstado.toUpperCase());
        return habitacionRepository.save(hab);
    }

    /**
     * Elimina una habitación por su ID dentro de una transacción.
     */
    @Transactional
    public boolean eliminar(Long id) {
        if (habitacionRepository.existsById(id)) {
            habitacionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}

