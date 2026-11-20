package com.hotelalborada.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

/**
 * Entidad JPA que representa un abono o liquidación económica de una reserva.
 */
@Entity
@Table(
        name = "pagos",
        indexes = {
                @Index(name = "idx_pagos_reserva", columnList = "id_reserva"),
                @Index(name = "idx_pagos_recibo", columnList = "recibo_caja")
        }
)
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @NotNull(message = "El identificador de reserva es obligatorio")
    @Column(name = "id_reserva", nullable = false)
    private Long idReserva;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a cero")
    @Column(name = "monto", nullable = false)
    private Double monto;

    @NotBlank(message = "El método de pago es obligatorio")
    @Column(name = "metodo", nullable = false, length = 20)
    private String metodo;

    @NotBlank(message = "El número de recibo de caja es obligatorio")
    @Column(name = "recibo_caja", nullable = false, unique = true, length = 40)
    private String reciboCaja;

    @Column(name = "registrado_por", length = 120)
    private String registradoPor;

    @Column(name = "fecha")
    private LocalDateTime fecha = LocalDateTime.now();

    public Pago() {}

    public Pago(Long idPago, Long idReserva, Double monto, String metodo, String reciboCaja, String registradoPor) {
        this.idPago = idPago;
        this.idReserva = idReserva;
        this.monto = monto;
        this.metodo = metodo;
        this.reciboCaja = reciboCaja;
        this.registradoPor = registradoPor;
        this.fecha = LocalDateTime.now();
    }

    public Long getIdPago() {
        return idPago;
    }

    public void setIdPago(Long idPago) {
        this.idPago = idPago;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public Double getMonto() {
        return monto;
    }

    public void setMonto(Double monto) {
        this.monto = monto;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public String getReciboCaja() {
        return reciboCaja;
    }

    public void setReciboCaja(String reciboCaja) {
        this.reciboCaja = reciboCaja;
    }

    public String getRegistradoPor() {
        return registradoPor;
    }

    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
