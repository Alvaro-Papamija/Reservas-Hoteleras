package com.hotelalborada.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad JPA central que representa una reserva contractual de estancia en el hotel.
 */
@Entity
@Table(
        name = "reservas",
        indexes = {
                @Index(name = "idx_reservas_codigo", columnList = "codigo"),
                @Index(name = "idx_reservas_cliente", columnList = "id_cliente"),
                @Index(name = "idx_reservas_habitacion", columnList = "id_habitacion"),
                @Index(name = "idx_reservas_fechas", columnList = "fecha_entrada, fecha_salida"),
                @Index(name = "idx_reservas_estado", columnList = "estado")
        }
)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Long idReserva;

    @NotBlank(message = "El código de reserva es obligatorio")
    @Column(name = "codigo", nullable = false, unique = true, length = 30)
    private String codigo;

    @NotNull(message = "El identificador de cliente es obligatorio")
    @Column(name = "id_cliente", nullable = false)
    private Long idCliente;

    @NotNull(message = "El identificador de habitación es obligatorio")
    @Column(name = "id_habitacion", nullable = false)
    private Long idHabitacion;

    @NotNull(message = "La fecha de entrada es obligatoria")
    @Column(name = "fecha_entrada", nullable = false)
    private LocalDate fechaEntrada;

    @NotNull(message = "La fecha de salida es obligatoria")
    @Column(name = "fecha_salida", nullable = false)
    private LocalDate fechaSalida;

    @NotNull(message = "La cantidad de huéspedes es obligatoria")
    @Positive(message = "La cantidad de huéspedes debe ser mayor a cero")
    @Column(name = "cantidad_huespedes", nullable = false)
    private Integer cantidadHuespedes;

    @NotNull(message = "El precio por noche es obligatorio")
    @Column(name = "precio_noche", nullable = false)
    private Double precioNoche;

    @NotNull(message = "La cantidad de noches es obligatoria")
    @Column(name = "cantidad_noches", nullable = false)
    private Integer cantidadNoches;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

    @Column(name = "descuento")
    private Double descuento = 0.0;

    @Column(name = "total", nullable = false)
    private Double total;

    @Column(name = "cupon_aplicado", length = 30)
    private String cuponAplicado;

    @Column(name = "saldo", nullable = false)
    private Double saldo = 0.0;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "CONFIRMADA";

    @Column(name = "numero_llave", length = 20)
    private String numeroLlave;

    @Column(name = "fecha_checkin")
    private LocalDateTime fechaCheckin;

    @Column(name = "fecha_checkout")
    private LocalDateTime fechaCheckout;

    @Column(name = "motivo_cancelacion", columnDefinition = "TEXT")
    private String motivoCancelacion;

    @Column(name = "notas", columnDefinition = "TEXT")
    private String notas;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @OneToMany(mappedBy = "idReserva", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pago> pagos = new ArrayList<>();

    public Reserva() {}

    public Long getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(Long idReserva) {
        this.idReserva = idReserva;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public Long getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Long idCliente) {
        this.idCliente = idCliente;
    }

    public Long getIdHabitacion() {
        return idHabitacion;
    }

    public void setIdHabitacion(Long idHabitacion) {
        this.idHabitacion = idHabitacion;
    }

    public LocalDate getFechaEntrada() {
        return fechaEntrada;
    }

    public void setFechaEntrada(LocalDate fechaEntrada) {
        this.fechaEntrada = fechaEntrada;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public Integer getCantidadHuespedes() {
        return cantidadHuespedes;
    }

    public void setCantidadHuespedes(Integer cantidadHuespedes) {
        this.cantidadHuespedes = cantidadHuespedes;
    }

    public Double getPrecioNoche() {
        return precioNoche;
    }

    public void setPrecioNoche(Double precioNoche) {
        this.precioNoche = precioNoche;
    }

    public Integer getCantidadNoches() {
        return cantidadNoches;
    }

    public void setCantidadNoches(Integer cantidadNoches) {
        this.cantidadNoches = cantidadNoches;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getDescuento() {
        return descuento;
    }

    public void setDescuento(Double descuento) {
        this.descuento = descuento;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public String getCuponAplicado() {
        return cuponAplicado;
    }

    public void setCuponAplicado(String cuponAplicado) {
        this.cuponAplicado = cuponAplicado;
    }

    public Double getSaldo() {
        return saldo;
    }

    public void setSaldo(Double saldo) {
        this.saldo = saldo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getNumeroLlave() {
        return numeroLlave;
    }

    public void setNumeroLlave(String numeroLlave) {
        this.numeroLlave = numeroLlave;
    }

    public LocalDateTime getFechaCheckin() {
        return fechaCheckin;
    }

    public void setFechaCheckin(LocalDateTime fechaCheckin) {
        this.fechaCheckin = fechaCheckin;
    }

    public LocalDateTime getFechaCheckout() {
        return fechaCheckout;
    }

    public void setFechaCheckout(LocalDateTime fechaCheckout) {
        this.fechaCheckout = fechaCheckout;
    }

    public String getMotivoCancelacion() {
        return motivoCancelacion;
    }

    public void setMotivoCancelacion(String motivoCancelacion) {
        this.motivoCancelacion = motivoCancelacion;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<Pago> getPagos() {
        return pagos;
    }

    public void setPagos(List<Pago> pagos) {
        this.pagos = pagos;
    }
}
