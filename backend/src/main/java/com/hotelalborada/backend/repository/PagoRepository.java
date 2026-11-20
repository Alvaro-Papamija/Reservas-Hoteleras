package com.hotelalborada.backend.repository;

import com.hotelalborada.backend.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByIdReservaOrderByFechaAsc(Long idReserva);
    Optional<Pago> findByReciboCaja(String reciboCaja);
}
