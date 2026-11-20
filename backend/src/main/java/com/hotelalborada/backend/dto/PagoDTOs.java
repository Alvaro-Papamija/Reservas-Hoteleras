package com.hotelalborada.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public class PagoDTOs {

    public static class RegistrarPagoRequest {
        @NotNull(message = "El identificador de reserva es obligatorio")
        private Long idReserva;

        @NotNull(message = "El monto a pagar es obligatorio")
        @Positive(message = "El monto debe ser estrictamente positivo")
        private Double monto;

        @NotBlank(message = "El método de pago es obligatorio (EFECTIVO, TARJETA, TRANSFERENCIA)")
        private String metodo;

        public RegistrarPagoRequest() {}

        public RegistrarPagoRequest(Long idReserva, Double monto, String metodo) {
            this.idReserva = idReserva;
            this.monto = monto;
            this.metodo = metodo;
        }

        public Long getIdReserva() { return idReserva; }
        public void setIdReserva(Long idReserva) { this.idReserva = idReserva; }

        public Double getMonto() { return monto; }
        public void setMonto(Double monto) { this.monto = monto; }

        public String getMetodo() { return metodo; }
        public void setMetodo(String metodo) { this.metodo = metodo; }
    }

    public static class PagoResponse {
        private Long idPago;
        private Long idReserva;
        private Double monto;
        private String metodo;
        private String reciboCaja;
        private String registradoPor;
        private LocalDateTime fecha;

        public PagoResponse() {}

        public PagoResponse(Long idPago, Long idReserva, Double monto, String metodo,
                            String reciboCaja, String registradoPor, LocalDateTime fecha) {
            this.idPago = idPago;
            this.idReserva = idReserva;
            this.monto = monto;
            this.metodo = metodo;
            this.reciboCaja = reciboCaja;
            this.registradoPor = registradoPor;
            this.fecha = fecha;
        }

        public Long getIdPago() { return idPago; }
        public void setIdPago(Long idPago) { this.idPago = idPago; }

        public Long getIdReserva() { return idReserva; }
        public void setIdReserva(Long idReserva) { this.idReserva = idReserva; }

        public Double getMonto() { return monto; }
        public void setMonto(Double monto) { this.monto = monto; }

        public String getMetodo() { return metodo; }
        public void setMetodo(String metodo) { this.metodo = metodo; }

        public String getReciboCaja() { return reciboCaja; }
        public void setReciboCaja(String reciboCaja) { this.reciboCaja = reciboCaja; }

        public String getRegistradoPor() { return registradoPor; }
        public void setRegistradoPor(String registradoPor) { this.registradoPor = registradoPor; }

        public LocalDateTime getFecha() { return fecha; }
        public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    }
}
