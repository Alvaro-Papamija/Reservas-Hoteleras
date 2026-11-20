package com.hotelalborada.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * Entidad JPA para cupones y descuentos promocionales.
 */
@Entity
@Table(
        name = "cupones",
        indexes = {
                @Index(name = "idx_cupones_codigo", columnList = "codigo")
        }
)
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cupon")
    private Long idCupon;

    @NotBlank(message = "El código es obligatorio")
    @Column(name = "codigo", nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;

    @Column(name = "porcentaje_descuento")
    private Double porcentajeDescuento = 0.0;

    @Column(name = "descuento_fijo")
    private Double descuentoFijo = 0.0;

    @Column(name = "noches_minimas")
    private Integer nochesMinimas = 1;

    @Column(name = "monto_minimo")
    private Double montoMinimo = 0.0;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_expiracion")
    private LocalDate fechaExpiracion;

    public Cupon() {}

    public Long getIdCupon() {
        return idCupon;
    }

    public void setIdCupon(Long idCupon) {
        this.idCupon = idCupon;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Double getPorcentajeDescuento() {
        return porcentajeDescuento;
    }

    public void setPorcentajeDescuento(Double porcentajeDescuento) {
        this.porcentajeDescuento = porcentajeDescuento;
    }

    public Double getDescuentoFijo() {
        return descuentoFijo;
    }

    public void setDescuentoFijo(Double descuentoFijo) {
        this.descuentoFijo = descuentoFijo;
    }

    public Integer getNochesMinimas() {
        return nochesMinimas;
    }

    public void setNochesMinimas(Integer nochesMinimas) {
        this.nochesMinimas = nochesMinimas;
    }

    public Double getMontoMinimo() {
        return montoMinimo;
    }

    public void setMontoMinimo(Double montoMinimo) {
        this.montoMinimo = montoMinimo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDate getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDate fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }
}
