package com.hotelalborada.backend.service;

import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.repository.HabitacionRepository;
import com.hotelalborada.backend.repository.HabitacionResumen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Capa de Servicio empresarial que contiene la lógica de negocio y delimita las transacciones con PostgreSQL.
 */
@Service
@Transactional(readOnly = true)
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;

    public HabitacionService(HabitacionRepository habitacionRepository) {
        this.habitacionRepository = habitacionRepository;
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

