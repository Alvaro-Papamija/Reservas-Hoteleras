# 🏨 Documentación Técnica de Endpoints RESTful - Hotel Alborada Boutique

> **Sprint 2 - Entregable Oficial**  
> **Versión de API:** `2.0.0`  
> **Arquitectura:** Spring Boot 3.3.5 / Java 21 / PostgreSQL / Spring Security 6 (Stateless JWT)  
> **Consola Interactiva Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
> **Especificación OpenAPI 3 JSON:** [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 📑 Tabla de Contenidos
1. [Autenticación y Seguridad (JWT & RBAC)](#1-autenticación-y-seguridad)
2. [Módulo de Habitaciones (Catálogo e Inventario)](#2-módulo-de-habitaciones)
3. [Módulo de Reservas (Expedientes y Estancias)](#3-módulo-de-reservas)
4. [Módulo de Clientes (Huéspedes y Walk-in)](#4-módulo-de-clientes)
5. [Módulo de Pagos (Liquidación y Recibos de Caja)](#5-módulo-de-pagos)
6. [Estructura de Base de Datos Relacional](#6-estructura-de-base-de-datos-relacional)

---

## 1. Autenticación y Seguridad

Todos los endpoints protegidos requieren el encabezado HTTP:
```http
Authorization: Bearer <TOKEN_JWT>
```

### Roles Soportados (RBAC):
- `ADMINISTRADOR`: Control total sobre inventario, cancelaciones, reportes y usuarios.
- `RECEPCIONISTA`: Operaciones de front-desk, registro de huéspedes walk-in, check-in con llave física y abonos en counter.
- `CLIENTE`: Consulta de catálogo, creación de reservas privadas y seguimiento de sus propias estancias.

---

### POST `/api/auth/login`
Inicia sesión validando credenciales contra hash seguro **BCrypt** (cost factor 12) y protección contra ataques de fuerza bruta.

* **Acceso:** Público
* **Cuerpo de la Petición:**
```json
{
  "correo": "alvaro@hotelalborada.com",
  "contrasena": "Admin123*"
}
```
* **Respuesta Exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expiracionMs": 3600000,
  "usuario": {
    "idUsuario": 1,
    "nombre": "Alvaro Papamija",
    "correo": "alvaro@hotelalborada.com",
    "rol": "ADMINISTRADOR",
    "estado": true
  }
}
```

---

### POST `/api/auth/register`
Registra un nuevo usuario en la plataforma forzando inmutablemente el rol `CLIENTE` (mitigación OWASP Mass Assignment).

* **Acceso:** Público
* **Cuerpo de la Petición:**
```json
{
  "nombre": "Mariana Gómez",
  "correo": "mariana@ejemplo.com",
  "contrasena": "PasswordSegura2026*"
}
```
* **Respuesta Exitosa (201 Created):** Retorna el token JWT emitido y el perfil creado con rol `CLIENTE`.

---

### POST `/api/auth/logout`
Revoca inmediatamente el token JWT en el servidor mediante lista negra en memoria (`TokenRevocationService`).

* **Acceso:** Público / Autenticado
* **Encabezado:** `Authorization: Bearer <TOKEN>`
* **Respuesta (200 OK):**
```json
{
  "mensaje": "Sesión finalizada con éxito."
}
```

---

### GET `/api/auth/me`
Retorna el perfil del usuario actualmente autenticado según su token.

* **Acceso:** Requiere token válido (`CLIENTE`, `RECEPCIONISTA`, `ADMINISTRADOR`).

---

## 2. Módulo de Habitaciones

Gestiona el catálogo público de habitaciones y la administración física de inventario.

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/habitaciones/salud` | Público | Comprobación de salud y estado de conexión PostgreSQL. |
| `GET` | `/api/habitaciones` | Público | Listado completo de todas las habitaciones. |
| `GET` | `/api/habitaciones/paginado` | Público | Listado con soporte de paginación (`page`, `size`, `sortBy`). |
| `GET` | `/api/habitaciones/resumen` | Público | Proyecciones ligeras JPA optimizadas. |
| `GET` | `/api/habitaciones/{id}` | Público | Consulta de habitación por ID. |
| `POST` | `/api/habitaciones` | `ADMINISTRADOR` | **CRUD Create:** Da de alta una nueva habitación. |
| `PUT` | `/api/habitaciones/{id}` | `ADMINISTRADOR` | **CRUD Update:** Modifica los atributos, tipo o precio de una suite. |
| `PATCH` | `/api/habitaciones/{id}/estado` | `ADMINISTRADOR` | Actualiza el estado operativo (`DISPONIBLE`, `MANTENIMIENTO`, etc.). |
| `DELETE` | `/api/habitaciones/{id}` | `ADMINISTRADOR` | **CRUD Delete:** Elimina una habitación del inventario. |

---

## 3. Módulo de Reservas

Expedientes contractuales de reservas con liquidación de noches, verificación de solapamiento y flujo de recepción.

### POST `/api/reservas` (Crear Reserva)
* **Acceso:** Autenticado
* **Validación de Reglas de Negocio:**
  - `fechaSalida` debe ser posterior a `fechaEntrada`.
  - La habitación debe estar activa.
  - Verifica que no exista **ninguna reserva activa que se solape en el mismo rango de fechas**.
  - Si se envía un cupón válido (ej: `BIENVENIDA2026`), calcula el descuento y el saldo restante.
* **Cuerpo de la Petición:**
```json
{
  "idHabitacion": 2,
  "idCliente": 1,
  "fechaEntrada": "2026-12-15",
  "fechaSalida": "2026-12-18",
  "cantidadHuespedes": 2,
  "cuponCodigo": "BIENVENIDA2026",
  "notas": "Viaje de aniversario, solicitaron lencería blanca."
}
```
* **Respuesta Exitosa (201 Created):**
```json
{
  "idReserva": 1,
  "codigo": "RH-20261215-4819",
  "idCliente": 1,
  "clienteNombre": "Laura Gómez",
  "clienteDocumento": "1085294821",
  "clienteCorreo": "laura.gomez@ejemplo.com",
  "idHabitacion": 2,
  "habitacionNumero": "102",
  "habitacionTipo": "Doble",
  "fechaEntrada": "2026-12-15",
  "fechaSalida": "2026-12-18",
  "cantidadHuespedes": 2,
  "precioNoche": 180000.0,
  "cantidadNoches": 3,
  "subtotal": 540000.0,
  "descuento": 81000.0,
  "total": 459000.0,
  "cuponAplicado": "BIENVENIDA2026",
  "saldo": 459000.0,
  "estado": "CONFIRMADA",
  "fechaCreacion": "2026-11-20T06:50:00"
}
```

---

### PUT `/api/reservas/{id}/fechas` (Modificar Fechas)
* **Acceso:** Autenticado (`ADMINISTRADOR`, `RECEPCIONISTA`, `CLIENTE`)
* **Descripción:** Reprograma una estancia recalculando el número de noches, subtotal y saldo, excluyendo la propia reserva en la verificación de solapamiento.
* **Cuerpo:**
```json
{
  "fechaEntrada": "2026-12-16",
  "fechaSalida": "2026-12-20"
}
```

---

### PATCH `/api/reservas/{id}/checkin` (Check-In y Asignación de Llave)
* **Acceso:** `RECEPCIONISTA` o `ADMINISTRADOR`
* **Descripción:** Registra la llegada formal del huésped, asigna el código de la llave física entregada, fija la marca de tiempo `fechaCheckin` y pasa el estado de la habitación a `OCUPADA`.
* **Cuerpo:**
```json
{
  "numeroLlave": "LLAVE-102"
}
```

---

### PATCH `/api/reservas/{id}/cancelar` (Cancelación Lógica)
* **Acceso:** Autenticado
* **Descripción:** Cambia el estado a `CANCELADA`, almacena el motivo y libera automáticamente la habitación a estado `DISPONIBLE`.
* **Cuerpo:**
```json
{
  "motivoCancelacion": "Cambio en itinerario de vuelos"
}
```

---

## 4. Módulo de Clientes

Fichas maestras de huéspedes frecuentes y clientes atendidos en recepción (Walk-in).

| Método | Endpoint | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/clientes` | `RECEPCIONISTA` / `ADMIN` | **CRUD Create:** Registra nuevo huésped con validación de documento único. |
| `GET` | `/api/clientes` | `RECEPCIONISTA` / `ADMIN` | **CRUD Read:** Listado general de huéspedes. |
| `GET` | `/api/clientes/{id}` | `RECEPCIONISTA` / `ADMIN` | Consulta por ID primario. |
| `GET` | `/api/clientes/documento/{doc}` | `RECEPCIONISTA` / `ADMIN` | Búsqueda rápida por cédula o pasaporte. |
| `PUT` | `/api/clientes/{id}` | `RECEPCIONISTA` / `ADMIN` | **CRUD Update:** Modifica teléfono, correo o dirección del cliente. |

---

## 5. Módulo de Pagos

Liquidación de cuentas, pagos de contado o transferencias y emisión de recibos de caja oficiales.

### POST `/api/pagos` (Registrar Pago en Counter)
* **Acceso:** `RECEPCIONISTA` o `ADMINISTRADOR`
* **Descripción:** Genera un número de recibo de caja (`REC-YYYY-XXXX`), descuenta el monto abonado del saldo pendiente de la reserva y registra el usuario responsable.
* **Cuerpo:**
```json
{
  "idReserva": 1,
  "monto": 200000.0,
  "metodo": "TARJETA"
}
```
* **Respuesta (201 Created):**
```json
{
  "idPago": 3,
  "idReserva": 1,
  "monto": 200000.0,
  "metodo": "TARJETA",
  "reciboCaja": "REC-2026-7812",
  "registradoPor": "recepcion@hotelalborada.com",
  "fecha": "2026-11-20T06:51:00"
}
```

---

## 6. Estructura de Base de Datos Relacional

Los scripts SQL están disponibles en el directorio `backend/src/main/resources/db/`:
- **`schema.sql`**: Definición DDL con tablas `usuarios`, `tipos_habitacion`, `habitaciones`, `clientes`, `cupones`, `reservas` y `pagos`, con integridad referencial (`FK`), constraints `CHECK` e índices de aceleración.
- **`data.sql`**: Semilla DML con categorías de habitaciones, catálogo inicial, perfiles de usuario por rol y reservas de prueba.
