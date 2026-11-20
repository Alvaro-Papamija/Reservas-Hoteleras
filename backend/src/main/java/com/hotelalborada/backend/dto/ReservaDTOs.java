package com.hotelalborada.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ReservaDTOs {

    public static class CrearReservaRequest {
        @NotNull(message = "El ID de habitación es obligatorio")
        private Long idHabitacion;

        @NotNull(message = "El ID del cliente es obligatorio")
        private Long idCliente;

        @NotNull(message = "La fecha de entrada es obligatoria")
        @FutureOrPresent(message = "La fecha de entrada debe ser hoy o una fecha futura")
        private LocalDate fechaEntrada;

        @NotNull(message = "La fecha de salida es obligatoria")
        private LocalDate fechaSalida;

        @NotNull(message = "La cantidad de huéspedes es obligatoria")
        @Min(value = 1, message = "Debe haber al menos 1 huésped")
        private Integer cantidadHuespedes;

        private String cuponCodigo;
        private String notas;

        public CrearReservaRequest() {}

        public Long getIdHabitacion() { return idHabitacion; }
        public void setIdHabitacion(Long idHabitacion) { this.idHabitacion = idHabitacion; }

        public Long getIdCliente() { return idCliente; }
        public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

        public LocalDate getFechaEntrada() { return fechaEntrada; }
        public void setFechaEntrada(LocalDate fechaEntrada) { this.fechaEntrada = fechaEntrada; }

        public LocalDate getFechaSalida() { return fechaSalida; }
        public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }

        public Integer getCantidadHuespedes() { return cantidadHuespedes; }
        public void setCantidadHuespedes(Integer cantidadHuespedes) { this.cantidadHuespedes = cantidadHuespedes; }

        public String getCuponCodigo() { return cuponCodigo; }
        public void setCuponCodigo(String cuponCodigo) { this.cuponCodigo = cuponCodigo; }

        public String getNotas() { return notas; }
        public void setNotas(String notas) { this.notas = notas; }
    }

    public static class ModificarFechasRequest {
        @NotNull(message = "La nueva fecha de entrada es obligatoria")
        private LocalDate fechaEntrada;

        @NotNull(message = "La nueva fecha de salida es obligatoria")
        private LocalDate fechaSalida;

        public ModificarFechasRequest() {}

        public LocalDate getFechaEntrada() { return fechaEntrada; }
        public void setFechaEntrada(LocalDate fechaEntrada) { this.fechaEntrada = fechaEntrada; }

        public LocalDate getFechaSalida() { return fechaSalida; }
        public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }
    }

    public static class CheckInRequest {
        @NotBlank(message = "El identificador de la llave física es obligatorio")
        private String numeroLlave;

        public CheckInRequest() {}

        public String getNumeroLlave() { return numeroLlave; }
        public void setNumeroLlave(String numeroLlave) { this.numeroLlave = numeroLlave; }
    }

    public static class CancelarReservaRequest {
        @NotBlank(message = "El motivo de la cancelación es obligatorio")
        private String motivoCancelacion;

        public CancelarReservaRequest() {}

        public String getMotivoCancelacion() { return motivoCancelacion; }
        public void setMotivoCancelacion(String motivoCancelacion) { this.motivoCancelacion = motivoCancelacion; }
    }

    public static class ReservaResponse {
        private Long idReserva;
        private String codigo;
        private Long idCliente;
        private String clienteNombre;
        private String clienteDocumento;
        private String clienteCorreo;
        private Long idHabitacion;
        private String habitacionNumero;
        private String habitacionTipo;
        private LocalDate fechaEntrada;
        private LocalDate fechaSalida;
        private Integer cantidadHuespedes;
        private Double precioNoche;
        private Integer cantidadNoches;
        private Double subtotal;
        private Double descuento;
        private Double total;
        private String cuponAplicado;
        private Double saldo;
        private String estado;
        private String numeroLlave;
        private LocalDateTime fechaCheckin;
        private String notas;
        private LocalDateTime fechaCreacion;

        public ReservaResponse() {}

        public Long getIdReserva() { return idReserva; }
        public void setIdReserva(Long idReserva) { this.idReserva = idReserva; }

        public String getCodigo() { return codigo; }
        public void setCodigo(String codigo) { this.codigo = codigo; }

        public Long getIdCliente() { return idCliente; }
        public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

        public String getClienteNombre() { return clienteNombre; }
        public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

        public String getClienteDocumento() { return clienteDocumento; }
        public void setClienteDocumento(String clienteDocumento) { this.clienteDocumento = clienteDocumento; }

        public String getClienteCorreo() { return clienteCorreo; }
        public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }

        public Long getIdHabitacion() { return idHabitacion; }
        public void setIdHabitacion(Long idHabitacion) { this.idHabitacion = idHabitacion; }

        public String getHabitacionNumero() { return habitacionNumero; }
        public void setHabitacionNumero(String habitacionNumero) { this.habitacionNumero = habitacionNumero; }

        public String getHabitacionTipo() { return habitacionTipo; }
        public void setHabitacionTipo(String habitacionTipo) { this.habitacionTipo = habitacionTipo; }

        public LocalDate getFechaEntrada() { return fechaEntrada; }
        public void setFechaEntrada(LocalDate fechaEntrada) { this.fechaEntrada = fechaEntrada; }

        public LocalDate getFechaSalida() { return fechaSalida; }
        public void setFechaSalida(LocalDate fechaSalida) { this.fechaSalida = fechaSalida; }

        public Integer getCantidadHuespedes() { return cantidadHuespedes; }
        public void setCantidadHuespedes(Integer cantidadHuespedes) { this.cantidadHuespedes = cantidadHuespedes; }

        public Double getPrecioNoche() { return precioNoche; }
        public void setPrecioNoche(Double precioNoche) { this.precioNoche = precioNoche; }

        public Integer getCantidadNoches() { return cantidadNoches; }
        public void setCantidadNoches(Integer cantidadNoches) { this.cantidadNoches = cantidadNoches; }

        public Double getSubtotal() { return subtotal; }
        public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

        public Double getDescuento() { return descuento; }
        public void setDescuento(Double descuento) { this.descuento = descuento; }

        public Double getTotal() { return total; }
        public void setTotal(Double total) { this.total = total; }

        public String getCuponAplicado() { return cuponAplicado; }
        public void setCuponAplicado(String cuponAplicado) { this.cuponAplicado = cuponAplicado; }

        public Double getSaldo() { return saldo; }
        public void setSaldo(Double saldo) { this.saldo = saldo; }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }

        public String getNumeroLlave() { return numeroLlave; }
        public void setNumeroLlave(String numeroLlave) { this.numeroLlave = numeroLlave; }

        public LocalDateTime getFechaCheckin() { return fechaCheckin; }
        public void setFechaCheckin(LocalDateTime fechaCheckin) { this.fechaCheckin = fechaCheckin; }

        public String getNotas() { return notas; }
        public void setNotas(String notas) { this.notas = notas; }

        public LocalDateTime getFechaCreacion() { return fechaCreacion; }
        public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    }
}
