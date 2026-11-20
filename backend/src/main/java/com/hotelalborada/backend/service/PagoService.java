package com.hotelalborada.backend.service;

import com.hotelalborada.backend.dto.PagoDTOs.*;
import com.hotelalborada.backend.model.Pago;
import com.hotelalborada.backend.model.Reserva;
import com.hotelalborada.backend.repository.PagoRepository;
import com.hotelalborada.backend.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional(readOnly = true)
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    public PagoService(PagoRepository pagoRepository, ReservaRepository reservaRepository) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
    }

    public List<PagoResponse> listarPorReserva(Long idReserva) {
        return pagoRepository.findByIdReservaOrderByFechaAsc(idReserva).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public PagoResponse registrarPago(RegistrarPagoRequest request, String registradoPor) {
        Reserva reserva = reservaRepository.findById(request.getIdReserva())
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + request.getIdReserva()));

        if ("CANCELADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("No se pueden registrar pagos a una reserva cancelada.");
        }

        if (request.getMonto() <= 0) {
            throw new IllegalArgumentException("El monto a pagar debe ser mayor a cero.");
        }

        double nuevoSaldo = Math.max(0.0, reserva.getSaldo() - request.getMonto());
        reserva.setSaldo(nuevoSaldo);
        reservaRepository.save(reserva);

        String reciboCaja = "REC-" + LocalDate.now().getYear() + "-" + ThreadLocalRandom.current().nextInt(1000, 9999);

        Pago pago = new Pago();
        pago.setIdReserva(reserva.getIdReserva());
        pago.setMonto(request.getMonto());
        pago.setMetodo(request.getMetodo().toUpperCase());
        pago.setReciboCaja(reciboCaja);
        pago.setRegistradoPor(registradoPor != null ? registradoPor : "Counter Recepción");
        pago.setFecha(LocalDateTime.now());

        Pago guardado = pagoRepository.save(pago);
        return mapToResponse(guardado);
    }

    public PagoResponse mapToResponse(Pago p) {
        return new PagoResponse(
                p.getIdPago(),
                p.getIdReserva(),
                p.getMonto(),
                p.getMetodo(),
                p.getReciboCaja(),
                p.getRegistradoPor(),
                p.getFecha()
        );
    }
}
