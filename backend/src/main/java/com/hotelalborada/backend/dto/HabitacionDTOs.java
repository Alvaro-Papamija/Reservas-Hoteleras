package com.hotelalborada.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class HabitacionDTOs {

    public static class ActualizarHabitacionRequest {
        @NotBlank(message = "El tipo de habitación es obligatorio")
        private String tipo;

        @NotNull(message = "El precio base es obligatorio")
        @Positive(message = "El precio base debe ser mayor a cero")
        private Double precioBase;

        @NotBlank(message = "El estado es obligatorio (DISPONIBLE, RESERVADA, OCUPADA, MANTENIMIENTO)")
        private String estado;

        @NotNull(message = "El piso es obligatorio")
        @Positive(message = "El piso debe ser positivo")
        private Integer piso;

        private Boolean activa;
        private String descripcion;
        private String imagen;

        public ActualizarHabitacionRequest() {}

        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }

        public Double getPrecioBase() { return precioBase; }
        public void setPrecioBase(Double precioBase) { this.precioBase = precioBase; }

        public String getEstado() { return estado; }
        public void setEstado(String estado) { this.estado = estado; }

        public Integer getPiso() { return piso; }
        public void setPiso(Integer piso) { this.piso = piso; }

        public Boolean getActiva() { return activa; }
        public void setActiva(Boolean activa) { this.activa = activa; }

        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

        public String getImagen() { return imagen; }
        public void setImagen(String imagen) { this.imagen = imagen; }
    }
}
