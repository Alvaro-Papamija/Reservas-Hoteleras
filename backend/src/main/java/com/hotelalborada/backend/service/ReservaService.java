package com.hotelalborada.backend.service;

import com.hotelalborada.backend.dto.ReservaDTOs.*;
import com.hotelalborada.backend.model.Cliente;
import com.hotelalborada.backend.model.Cupon;
import com.hotelalborada.backend.model.Habitacion;
import com.hotelalborada.backend.model.Reserva;
import com.hotelalborada.backend.repository.ClienteRepository;
import com.hotelalborada.backend.repository.CuponRepository;
import com.hotelalborada.backend.repository.HabitacionRepository;
import com.hotelalborada.backend.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional(readOnly = true)
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;
    private final ClienteRepository clienteRepository;
    private final CuponRepository cuponRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          HabitacionRepository habitacionRepository,
                          ClienteRepository clienteRepository,
                          CuponRepository cuponRepository) {
        this.reservaRepository = reservaRepository;
        this.habitacionRepository = habitacionRepository;
        this.clienteRepository = clienteRepository;
        this.cuponRepository = cuponRepository;
    }

    public List<ReservaResponse> listarTodas() {
        return reservaRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReservaResponse> listarPorCliente(Long idCliente) {
        return reservaRepository.findByIdClienteOrderByFechaEntradaDesc(idCliente).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Optional<ReservaResponse> buscarPorId(Long id) {
        return reservaRepository.findById(id).map(this::mapToResponse);
    }

    public Optional<ReservaResponse> buscarPorCodigo(String codigo) {
        return reservaRepository.findByCodigo(codigo).map(this::mapToResponse);
    }

    @Transactional
    public ReservaResponse crear(CrearReservaRequest request) {
        if (!request.getFechaSalida().isAfter(request.getFechaEntrada())) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de entrada.");
        }

        Habitacion hab = habitacionRepository.findById(request.getIdHabitacion())
                .orElseThrow(() -> new IllegalArgumentException("Habitación no encontrada con ID: " + request.getIdHabitacion()));

        if (!Boolean.TRUE.equals(hab.getActiva())) {
            throw new IllegalStateException("La habitación " + hab.getNumero() + " está inactiva.");
        }

        Cliente cliente = clienteRepository.findById(request.getIdCliente())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + request.getIdCliente()));

        // Verificar disponibilidad sin solapamiento
        List<Reserva> solapadas = reservaRepository.findSolapadas(
                hab.getId(), request.getFechaEntrada(), request.getFechaSalida(), null
        );
        if (!solapadas.isEmpty()) {
            throw new IllegalStateException("La habitación " + hab.getNumero() + " ya tiene una reserva activa en las fechas seleccionadas.");
        }

        long noches = ChronoUnit.DAYS.between(request.getFechaEntrada(), request.getFechaSalida());
        double subtotal = hab.getPrecioBase() * noches;
        double descuento = 0.0;
        String cuponValido = null;

        if (request.getCuponCodigo() != null && !request.getCuponCodigo().isBlank()) {
            Optional<Cupon> optCupon = cuponRepository.findByCodigoIgnoreCaseAndActivoTrue(request.getCuponCodigo().trim());
            if (optCupon.isPresent()) {
                Cupon c = optCupon.get();
                if (noches >= c.getNochesMinimas()) {
                    if (c.getPorcentajeDescuento() != null && c.getPorcentajeDescuento() > 0) {
                        descuento = subtotal * (c.getPorcentajeDescuento() / 100.0);
                    } else if (c.getDescuentoFijo() != null && c.getDescuentoFijo() > 0) {
                        descuento = Math.min(c.getDescuentoFijo(), subtotal);
                    }
                    cuponValido = c.getCodigo();
                }
            }
        }

        double total = Math.max(0.0, subtotal - descuento);
        String codigo = generarCodigoReserva(request.getFechaEntrada());

        Reserva reserva = new Reserva();
        reserva.setCodigo(codigo);
        reserva.setIdCliente(cliente.getIdCliente());
        reserva.setIdHabitacion(hab.getId());
        reserva.setFechaEntrada(request.getFechaEntrada());
        reserva.setFechaSalida(request.getFechaSalida());
        reserva.setCantidadHuespedes(request.getCantidadHuespedes());
        reserva.setPrecioNoche(hab.getPrecioBase());
        reserva.setCantidadNoches((int) noches);
        reserva.setSubtotal(subtotal);
        reserva.setDescuento(descuento);
        reserva.setTotal(total);
        reserva.setCuponAplicado(cuponValido);
        reserva.setSaldo(total);
        reserva.setEstado("CONFIRMADA");
        reserva.setNotas(request.getNotas());
        reserva.setFechaCreacion(LocalDateTime.now());

        Reserva guardada = reservaRepository.save(reserva);
        return mapToResponse(guardada);
    }

    @Transactional
    public ReservaResponse modificarFechas(Long id, ModificarFechasRequest request) {
        if (!request.getFechaSalida().isAfter(request.getFechaEntrada())) {
            throw new IllegalArgumentException("La nueva fecha de salida debe ser posterior a la fecha de entrada.");
        }

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        if ("CANCELADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("No se pueden modificar las fechas de una reserva cancelada.");
        }

        // Verificar disponibilidad excluyendo la propia reserva
        List<Reserva> solapadas = reservaRepository.findSolapadas(
                reserva.getIdHabitacion(), request.getFechaEntrada(), request.getFechaSalida(), id
        );
        if (!solapadas.isEmpty()) {
            throw new IllegalStateException("La habitación no tiene disponibilidad en las nuevas fechas solicitadas.");
        }

        long noches = ChronoUnit.DAYS.between(request.getFechaEntrada(), request.getFechaSalida());
        double subtotal = reserva.getPrecioNoche() * noches;
        double descuento = 0.0;
        if (reserva.getCuponAplicado() != null) {
            Optional<Cupon> optCupon = cuponRepository.findByCodigoIgnoreCaseAndActivoTrue(reserva.getCuponAplicado());
            if (optCupon.isPresent() && optCupon.get().getPorcentajeDescuento() > 0) {
                descuento = subtotal * (optCupon.get().getPorcentajeDescuento() / 100.0);
            }
        }

        double total = Math.max(0.0, subtotal - descuento);
        double totalPagado = reserva.getTotal() - reserva.getSaldo();
        double nuevoSaldo = Math.max(0.0, total - totalPagado);

        reserva.setFechaEntrada(request.getFechaEntrada());
        reserva.setFechaSalida(request.getFechaSalida());
        reserva.setCantidadNoches((int) noches);
        reserva.setSubtotal(subtotal);
        reserva.setDescuento(descuento);
        reserva.setTotal(total);
        reserva.setSaldo(nuevoSaldo);

        Reserva actualizada = reservaRepository.save(reserva);
        return mapToResponse(actualizada);
    }

    @Transactional
    public ReservaResponse registrarCheckIn(Long id, CheckInRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        if ("CANCELADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("No se puede hacer check-in sobre una reserva cancelada.");
        }

        reserva.setNumeroLlave(request.getNumeroLlave().trim());
        reserva.setFechaCheckin(LocalDateTime.now());
        reserva.setEstado("CHECK_IN");

        // Actualizar estado físico de la habitación a OCUPADA
        habitacionRepository.findById(reserva.getIdHabitacion()).ifPresent(hab -> {
            hab.setEstado("OCUPADA");
            habitacionRepository.save(hab);
        });

        Reserva actualizada = reservaRepository.save(reserva);
        return mapToResponse(actualizada);
    }

    @Transactional
    public ReservaResponse cancelar(Long id, CancelarReservaRequest request) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + id));

        if ("CANCELADA".equals(reserva.getEstado())) {
            throw new IllegalStateException("La reserva ya se encuentra cancelada.");
        }

        reserva.setEstado("CANCELADA");
        reserva.setMotivoCancelacion(request.getMotivoCancelacion().trim());

        // Liberar habitación a DISPONIBLE si estaba en OCUPADA o RESERVADA
        habitacionRepository.findById(reserva.getIdHabitacion()).ifPresent(hab -> {
            hab.setEstado("DISPONIBLE");
            habitacionRepository.save(hab);
        });

        Reserva actualizada = reservaRepository.save(reserva);
        return mapToResponse(actualizada);
    }

    private String generarCodigoReserva(LocalDate fechaEntrada) {
        String fechaStr = fechaEntrada.format(DateTimeFormatter.BASIC_ISO_DATE);
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "RH-" + fechaStr + "-" + rand;
    }

    public ReservaResponse mapToResponse(Reserva r) {
        ReservaResponse res = new ReservaResponse();
        res.setIdReserva(r.getIdReserva());
        res.setCodigo(r.getCodigo());
        res.setIdCliente(r.getIdCliente());

        clienteRepository.findById(r.getIdCliente()).ifPresent(c -> {
            res.setClienteNombre(c.getNombre() + " " + c.getApellido());
            res.setClienteDocumento(c.getDocumento());
            res.setClienteCorreo(c.getCorreo());
        });

        res.setIdHabitacion(r.getIdHabitacion());
        habitacionRepository.findById(r.getIdHabitacion()).ifPresent(h -> {
            res.setHabitacionNumero(h.getNumero());
            res.setHabitacionTipo(h.getTipo());
        });

        res.setFechaEntrada(r.getFechaEntrada());
        res.setFechaSalida(r.getFechaSalida());
        res.setCantidadHuespedes(r.getCantidadHuespedes());
        res.setPrecioNoche(r.getPrecioNoche());
        res.setCantidadNoches(r.getCantidadNoches());
        res.setSubtotal(r.getSubtotal());
        res.setDescuento(r.getDescuento());
        res.setTotal(r.getTotal());
        res.setCuponAplicado(r.getCuponAplicado());
        res.setSaldo(r.getSaldo());
        res.setEstado(r.getEstado());
        res.setNumeroLlave(r.getNumeroLlave());
        res.setFechaCheckin(r.getFechaCheckin());
        res.setNotas(r.getNotas());
        res.setFechaCreacion(r.getFechaCreacion());
        return res;
    }
}
