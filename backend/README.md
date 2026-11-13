# Backend Hotel Grand Imperial / Alborada — Integración Java, Spring Boot y PostgreSQL

Módulo backend empresarial desarrollado con **Java 21 LTS**, **Spring Boot 3.3.5**, **Spring Data JPA** y base de datos relacional **PostgreSQL 16**.

---

## 1. Arquitectura y Rol de cada Tecnología

| Tecnología | Rol en la Arquitectura | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Java 21 LTS** | **Lenguaje y Base de Ejecución** | Entorno de ejecución en la JVM con tipado estricto, alto rendimiento, manejo seguro de memoria y threading moderno. |
| **Spring Boot 3.3.5** | **Framework de Aplicación y Orquestación** | Inversión de Control (IoC), inyección de dependencias, servidor web embebido (Tomcat), endpoints RESTful con Spring Web MVC y transaccionalidad declarativa (`@Transactional`). |
| **Spring Data JPA / Hibernate** | **Capa de Abstracción de Persistencia (ORM)** | Mapeo objeto-relacional entre clases Java (`@Entity`) y tablas SQL, generación automática de consultas y gestión del contexto de persistencia. |
| **Driver JDBC PostgreSQL (`org.postgresql:postgresql`)** | **Puente de Conectividad y Protocolo** | Convierte las llamadas SQL y parámetros de Hibernate al protocolo nativo de PostgreSQL a través del puerto TCP `5432`. |
| **PostgreSQL 16** | **Base de Datos Relacional y Persistencia** | Motor de base de datos relacional que asegura persistencia duradera, integridad referencial y propiedades ACID. |

### Flujo de Conexión Extremo a Extremo:

```
[ Cliente HTTP / Frontend ]
          │
          ▼  (Petición HTTP JSON: GET / POST / DELETE)
[ HabitacionController ]  (@RestController / @CrossOrigin)
          │
          ▼  (Lógica de negocio y contexto transaccional)
[ HabitacionService ]     (@Service / @Transactional)
          │
          ▼  (Operaciones CRUD declarativas)
[ HabitacionRepository ]  (Spring Data JPA Repository)
          │
          ▼  (Traducción Objeto-Relacional Hibernate)
[ PostgreSQL JDBC Driver ] (HikariCP Connection Pool)
          │
          ▼  (TCP Socket 5432 - Protocolo PostgreSQL)
[ PostgreSQL Database ]   (Tabla 'habitaciones' en hotel_alborada_db)
```

---

## 2. Configuración con Variables de Entorno

Siguiendo las recomendaciones de *Twelve-Factor App*, la configuración no expone contraseñas en código duro. En `src/main/resources/application.yml` se definen valores con variables de entorno y valores por defecto para desarrollo local:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:hotel_alborada_db}?sslmode=disable
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver
```

### Variables Configurables:
- `DB_HOST`: Host de la base de datos (por defecto `localhost`).
- `DB_PORT`: Puerto de escucha (por defecto `5432`).
- `DB_NAME`: Nombre de la base de datos (por defecto `hotel_alborada_db`).
- `DB_USERNAME`: Usuario administrador de PostgreSQL (por defecto `postgres`).
- `DB_PASSWORD`: Contraseña del usuario (por defecto `postgres`).
- `PORT`: Puerto HTTP del backend Spring Boot (por defecto `8080`).

---

## 3. Guía Paso a Paso para Levantar PostgreSQL Localmente

### Opción A: Levantar con Docker Compose (Recomendada)
Desde la carpeta `backend/`:

```bash
# Iniciar el contenedor de PostgreSQL en segundo plano
docker compose up -d

# Verificar que el contenedor esté corriendo y saludable
docker compose ps
```

### Opción B: Levantar con Docker CLI
```bash
docker run -d \
  --name hotel_postgres_db \
  -e POSTGRES_DB=hotel_alborada_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres_hotel_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

---

## 4. Compilación y Ejecución del Backend

Desde la carpeta `backend/`:

```bash
# 1. Compilar y ejecutar pruebas unitarias
mvn clean test

# 2. Iniciar la aplicación Spring Boot
mvn spring-boot:run

# O utilizando variables de entorno personalizadas:
DB_HOST=localhost DB_PORT=5432 DB_NAME=hotel_alborada_db DB_USERNAME=postgres DB_PASSWORD=mypassword mvn spring-boot:run
```

El servidor estará escuchando en `http://localhost:8080`.

---

## 5. Demostración Extremo a Extremo de la Conexión

Una vez iniciados PostgreSQL y la aplicación Spring Boot:

### 1. Verificar Estado de Conexión y Salud
```bash
curl -X GET http://localhost:8080/api/habitaciones/salud
```
**Respuesta esperada (HTTP 200 OK):**
```json
{
  "estado": "UP",
  "mensaje": "Backend Spring Boot conectado y operativo",
  "tecnologias": ["Java 21", "Spring Boot 3.3.5", "Spring Data JPA", "PostgreSQL"],
  "timestamp": "2026-11-13T10:15:00"
}
```

### 2. Registrar una Habitación en PostgreSQL (Escritura)
```bash
curl -X POST http://localhost:8080/api/habitaciones \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "201",
    "piso": 2,
    "tipo": "Suite Presidencial",
    "precioBase": 380000.0,
    "estado": "DISPONIBLE",
    "activa": true
  }'
```
**Respuesta esperada (HTTP 201 Created):**
```json
{
  "id": 1,
  "numero": "201",
  "piso": 2,
  "tipo": "Suite Presidencial",
  "precioBase": 380000.0,
  "estado": "DISPONIBLE",
  "activa": true
}
```

### 3. Consultar las Habitaciones desde PostgreSQL (Lectura)
```bash
curl -X GET http://localhost:8080/api/habitaciones
```

---

## 6. Supuestos Tomados y Puntos de Ajuste

1. **Versión de Java:** Se asumió **Java 21 LTS**, que es la versión Long Term Support moderna instalada y estándar en la industria para Spring Boot 3.3+.
2. **Gestor de Construcción:** Se utilizó **Apache Maven 3.9+** con el POM estándar de Spring Boot Starter Parent.
3. **Estructura del Proyecto:** Se aisló el código backend en la carpeta `backend/` para preservar intacta la aplicación frontend existente en la raíz y permitir que ambos componentes coexistan de manera limpia y modular en el mismo repositorio.
4. **Puntos de Ajuste para Despliegue:**
   - En entornos de producción (AWS RDS, Railway, Render o servidor local dedicado), reemplazar las variables en el archivo `.env` o en el orquestador de contenedores (`DB_HOST`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`).
   - Cambiar `spring.jpa.hibernate.ddl-auto` a `validate` o usar herramientas de migración como Flyway/Liquibase una vez estabilizado el esquema de producción.

