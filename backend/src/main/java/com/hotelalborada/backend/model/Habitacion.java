package com.hotelalborada.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Entidad JPA que representa una Habitación del hotel, mapeada a la tabla 'habitaciones' en PostgreSQL.
 * Incluye índices estratégicos para optimizar tiempos de consulta en búsquedas frecuentes.
 */
@Entity
@Table(
        name = "habitaciones",
        indexes = {
                @Index(name = "idx_habitaciones_numero", columnList = "numero"),
                @Index(name = "idx_habitaciones_estado", columnList = "estado"),
                @Index(name = "idx_habitaciones_activa", columnList = "activa"),
                @Index(name = "idx_habitaciones_tipo", columnList = "tipo")
        }
)
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El número de habitación es obligatorio")
    @Column(name = "numero", nullable = false, unique = true, length = 10)
    private String numero;

    @NotNull(message = "El piso es obligatorio")
    @Positive(message = "El piso debe ser un número positivo")
    @Column(name = "piso", nullable = false)
    private Integer piso;

    @NotBlank(message = "El tipo de habitación es obligatorio")
    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo;

    @NotNull(message = "El precio base es obligatorio")
    @Positive(message = "El precio base debe ser mayor a cero")
    @Column(name = "precio_base", nullable = false)
    private Double precioBase;

    @NotBlank(message = "El estado es obligatorio")
    @Column(name = "estado", nullable = false, length = 20)
    private String estado;

    @NotNull(message = "El indicador de actividad es obligatorio")
    @Column(name = "activa", nullable = false)
    private Boolean activa = true;

    // Constructores
    public Habitacion() {
    }

    public Habitacion(String numero, Integer piso, String tipo, Double precioBase, String estado, Boolean activa) {
        this.numero = numero;
        this.piso = piso;
        this.tipo = tipo;
        this.precioBase = precioBase;
        this.estado = estado;
        this.activa = activa;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Integer getPiso() {
        return piso;
    }

    public void setPiso(Integer piso) {
        this.piso = piso;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getPrecioBase() {
        return precioBase;
    }

    public void setPrecioBase(Double precioBase) {
        this.precioBase = precioBase;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    @Override
    public String toString() {
        return "Habitacion{" +
                "id=" + id +
                ", numero='" + numero + '\'' +
                ", piso=" + piso +
                ", tipo='" + tipo + '\'' +
                ", precioBase=" + precioBase +
                ", estado='" + estado + '\'' +
                ", activa=" + activa +
                '}';
    }
}

