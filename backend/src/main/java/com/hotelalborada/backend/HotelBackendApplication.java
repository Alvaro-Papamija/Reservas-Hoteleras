package com.hotelalborada.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada principal de la aplicación Spring Boot.
 * Habilita la auto-configuración, el escaneo de componentes y la configuración de Spring Data JPA.
 */
@SpringBootApplication
public class HotelBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HotelBackendApplication.class, args);
    }
}
