package com.hotelalborada.backend.repository;

import com.hotelalborada.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    Optional<Reserva> findByCodigo(String codigo);

    List<Reserva> findByIdClienteOrderByFechaEntradaDesc(Long idCliente);

    List<Reserva> findByEstadoOrderByFechaEntradaAsc(String estado);

    /**
     * Consulta optimizada para verificar solapamiento de fechas en una habitación.
     * Retorna reservas activas (no canceladas) cuyas fechas coincidan con el rango propuesto.
     */
    @Query("SELECT r FROM Reserva r WHERE r.idHabitacion = :idHabitacion " +
           "AND r.estado <> 'CANCELADA' " +
           "AND (:idReservaExcluir IS NULL OR r.idReserva <> :idReservaExcluir) " +
           "AND (r.fechaEntrada < :fechaSalida AND r.fechaSalida > :fechaEntrada)")
    List<Reserva> findSolapadas(
            @Param("idHabitacion") Long idHabitacion,
            @Param("fechaEntrada") LocalDate fechaEntrada,
            @Param("fechaSalida") LocalDate fechaSalida,
            @Param("idReservaExcluir") Long idReservaExcluir
    );
}
