package com.hotelalborada.backend.repository;

import com.hotelalborada.backend.model.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de Spring Data JPA para la entidad Habitacion.
 * Proporciona métodos CRUD automáticos, paginación y consultas derivadas sobre PostgreSQL.
 */
@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    /**
     * Busca una habitación por su número único.
     */
    Optional<Habitacion> findByNumero(String numero);

    /**
     * Retorna todas las habitaciones en un estado particular (DISPONIBLE, RESERVADA, etc.).
     */
    List<Habitacion> findByEstado(String estado);

    /**
     * Retorna todas las habitaciones que se encuentran activas en el inventario.
     */
    List<Habitacion> findByActivaTrue();
}
