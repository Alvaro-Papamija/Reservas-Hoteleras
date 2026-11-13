package com.hotelalborada.backend.repository;

/**
 * Proyección de Spring Data JPA que selecciona únicamente las columnas necesarias
 * para listados y vistas rápidas, minimizando el consumo de memoria y ancho de banda en PostgreSQL.
 */
public interface HabitacionResumen {

    Long getId();

    String getNumero();

    Integer getPiso();

    String getTipo();

    Double getPrecioBase();

    String getEstado();

    Boolean getActiva();
}

