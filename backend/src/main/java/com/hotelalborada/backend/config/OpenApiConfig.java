package com.hotelalborada.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración central de OpenAPI 3 / Swagger UI para la documentación viva de endpoints.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI hotelOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("API RESTful - Sistema de Gestión y Reservas Hotel Alborada Boutique")
                        .description("Documentación oficial y consola interactiva de endpoints para el Sprint 2. " +
                                "Cubre los módulos de Autenticación JWT, Inventario de Habitaciones, " +
                                "Expedientes de Reserva, Fichas de Huéspedes y Pagos en Counter.")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo e Ingeniería Hotel Alborada")
                                .email("ingenieria@hotelalborada.com")
                                .url("https://hotelalborada.com"))
                        .license(new License()
                                .name("MIT License / Uso Privado Empresarial")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingrese su token JWT generado en /api/auth/login para acceder a los endpoints protegidos por RBAC.")));
    }
}
