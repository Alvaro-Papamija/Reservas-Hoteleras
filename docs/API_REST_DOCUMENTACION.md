# MANUAL DE REFERENCIA DE LA API RESTful - SPRINT 2
## HOTEL ALBORADA BOUTIQUE

---

### 1. Información General de la API

* **URL Base de Desarrollo Local:** `http://localhost:8080`
* **Formato de Comunicación:** JSON (`application/json;charset=UTF-8`)
* **Consola Interactiva Swagger UI:** `http://localhost:8080/swagger-ui.html`
* **Especificación OpenAPI 3:** `http://localhost:8080/v3/api-docs`
* **Colección Postman:** `backend/Hotel_Alborada_Sprint2_Postman_Collection.json`

---

### 2. Autenticación y Cabeceras

Los endpoints protegidos requieren el envío del token JWT en la cabecera HTTP estándar:
```http
Authorization: Bearer <TOKEN_JWT>
```

#### Credenciales Semilla para Pruebas
| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **ADMINISTRADOR** | `alvaro@hotelalborada.com` | `Admin123*` |
| **RECEPCIONISTA** | `recepcion@hotelalborada.com` | `Recepcion123*` |
| **CLIENTE** | `laura.gomez@ejemplo.com` | `Cliente123*` |

---

### 3. Catálogo Completo de Endpoints

#### 3.1 Módulo: Autenticación (`/api/auth`)

##### `POST /api/auth/login`
Inicia sesión verificando correo y contraseña contra hash BCrypt. Retorna el token JWT y datos de rol.
* **Seguridad:** Pública
* **Body Request:**
  ```json
  {
    "correo": "alvaro@hotelalborada.com",
    "contrasena": "Admin123*"
  }
  ```
* **Response 200 OK:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tipo": "Bearer",
    "idUsuario": 1,
    "nombre": "Alvaro Papamija",
    "correo": "alvaro@hotelalborada.com",
    "rol": "ADMINISTRADOR",
    "expiraEnMs": 3600000
  }
  ```

##### `POST /api/auth/register`
Registra un nuevo usuario con rol forzado `CLIENTE` y crea automáticamente su ficha en el directorio de clientes.
* **Seguridad:** Pública
* **Body Request:**
  ```json
  {
    "nombre": "Diana",
    "apellido": "Morales",
    "correo": "diana.morales@ejemplo.com",
    "contrasena": "Cliente123*",
    "telefono": "+57 320 890 1234",
    "tipoDocumento": "CC",
    "documento": "1098765432",
    "direccion": "Carrera 15 # 85-30, Bogotá"
  }
  ```
* **Response 201 Created:** Retorna el token JWT generado para iniciar sesión de inmediato.

##### `GET /api/auth/me`
Consulta el perfil del usuario autenticado a partir del JWT.
* **Seguridad:** Requiere autenticación (`Bearer Token`)
* **Response 200 OK:**
  ```json
  {
    "idUsuario": 1,
    "nombre": "Alvaro Papamija",
    "correo": "alvaro@hotelalborada.com",
    "rol": "ADMINISTRADOR",
    "estado": true,
    "fechaCreacion": "2026-11-20T16:00:00Z"
  }
  ```

##### `POST /api/auth/logout`
Invalida el token JWT en el servidor impidiendo su reutilización.
* **Seguridad:** Requiere autenticación
* **Response 200 OK:**
  ```json
  {
    "mensaje": "Sesión finalizada con éxito."
  }
  ```

---

#### 3.2 Módulo: Habitaciones (`/api/habitaciones`)

##### `GET /api/habitaciones/salud`
Verifica la disponibilidad del backend y conectividad con la base de datos.
* **Seguridad:** Pública
* **Response 200 OK:**
  ```json
  {
    "estado": "UP",
    "mensaje": "Backend Spring Boot conectado y operativo",
    "tecnologias": ["Java 21", "Spring Boot 3.3.5", "Spring Data JPA", "PostgreSQL"],
    "timestamp": "2026-11-27T08:30:00"
  }
  ```

##### `GET /api/habitaciones`
Retorna el catálogo completo de habitaciones físicas.
* **Seguridad:** Pública
* **Response 200 OK:** Array de habitaciones con precio, estado y capacidad.

##### `GET /api/habitaciones/paginado?page=0&size=5&sortBy=numero`
Retorna habitaciones con paginación y ordenamiento en servidor.
* **Seguridad:** Pública

##### `GET /api/habitaciones/{id}`
Consulta el detalle de una habitación específica por su ID primario.
* **Seguridad:** Pública
* **Response 200 OK / 404 Not Found**

##### `POST /api/habitaciones` (CRUD - Create)
Registra una nueva habitación física en el inventario.
* **Seguridad:** Requiere rol `ADMINISTRADOR`
* **Body Request:**
  ```json
  {
    "numero": "302",
    "piso": 3,
    "idTipo": 5,
    "tipo": "Suite",
    "precioBase": 450000.00,
    "estado": "DISPONIBLE",
    "descripcion": "Suite Mirador con balcón colonial y jacuzzi exterior",
    "imagen": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    "activa": true
  }
  ```
* **Response 201 Created**

##### `PUT /api/habitaciones/{id}` (CRUD - Update)
Modifica los atributos, precio o estado activo de una habitación.
* **Seguridad:** Requiere rol `ADMINISTRADOR`
* **Response 200 OK / 404 Not Found**

##### `PATCH /api/habitaciones/{id}/estado?nuevoEstado=MANTENIMIENTO`
Actualiza el estado operativo (`DISPONIBLE`, `RESERVADA`, `OCUPADA`, `MANTENIMIENTO`).
* **Seguridad:** Requiere rol `ADMINISTRADOR` o `RECEPCIONISTA`

##### `DELETE /api/habitaciones/{id}` (CRUD - Delete)
Elimina físicamente una habitación del inventario.
* **Seguridad:** Requiere rol `ADMINISTRADOR`
* **Response 204 No Content / 404 Not Found**

---

#### 3.3 Módulo: Reservas (`/api/reservas`)

##### `POST /api/reservas` (CRUD - Create)
Crea una nueva reserva calculando automáticamente noches, subtotal, cupón de descuento y saldo.
* **Seguridad:** Requiere autenticación
* **Body Request:**
  ```json
  {
    "idHabitacion": 2,
    "fechaEntrada": "2026-12-25",
    "fechaSalida": "2026-12-28",
    "cantidadHuespedes": 2,
    "cuponCodigo": "BIENVENIDA2026",
    "notas": "Llegada aproximada a las 16:00",
    "cliente": {
      "nombre": "Laura",
      "apellido": "Gómez",
      "tipoDocumento": "CC",
      "documento": "1085294821",
      "telefono": "+57 312 458 9012",
      "correo": "laura.gomez@ejemplo.com"
    }
  }
  ```
* **Response 201 Created:**
  ```json
  {
    "idReserva": 3,
    "codigo": "RH-20261225-0105",
    "idHabitacion": 2,
    "habitacionNumero": "102",
    "fechaEntrada": "2026-12-25",
    "fechaSalida": "2026-12-28",
    "cantidadNoches": 3,
    "subtotal": 540000.00,
    "descuento": 81000.00,
    "total": 459000.00,
    "saldo": 459000.00,
    "estado": "CONFIRMADA"
  }
  ```

##### `GET /api/reservas` (CRUD - Read)
Lista todos los expedientes de reservas registradas en el hotel.
* **Seguridad:** Requiere autenticación (`ADMINISTRADOR` o `RECEPCIONISTA`)

##### `GET /api/reservas/{id}`
Consulta expediente de reserva por ID primario.

##### `GET /api/reservas/codigo/{codigo}`
Consulta expediente de reserva por código de voucher oficial (ej: `RH-20261215-0042`).

##### `GET /api/reservas/cliente/{idCliente}`
Consulta todas las reservas de un cliente específico.

##### `PUT /api/reservas/{id}/fechas` (CRUD - Update)
Reprograma fechas de estancia recalculando noches y saldo con validación de no solapamiento.
* **Seguridad:** Requiere autenticación

##### `PATCH /api/reservas/{id}/checkin` (CRUD - Update)
Registra la llegada del huésped, asigna el código de la llave física y cambia el estado a `CHECK_IN`.
* **Seguridad:** Requiere rol `ADMINISTRADOR` o `RECEPCIONISTA`
* **Body Request:**
  ```json
  {
    "numeroLlave": "LLAVE-102-RFID"
  }
  ```

##### `PATCH /api/reservas/{id}/cancelar` (CRUD - Delete Lógico)
Cancela una reserva registrando el motivo y liberando el inventario de la habitación.
* **Seguridad:** Requiere autenticación

---

#### 3.4 Módulo: Clientes (`/api/clientes`)

##### `POST /api/clientes` (CRUD - Create)
Registra un nuevo huésped walk-in con validación de documento único.
* **Seguridad:** Pública o Autenticada
* **Response 201 Created / 400 Bad Request**

##### `GET /api/clientes` (CRUD - Read)
Retorna el directorio completo de clientes.
* **Seguridad:** Requiere rol `ADMINISTRADOR` o `RECEPCIONISTA`

##### `GET /api/clientes/{id}`
Consulta la ficha de un cliente por ID.

##### `GET /api/clientes/documento/{documento}`
Consulta cliente por cédula, pasaporte o NIT.

##### `PUT /api/clientes/{id}` (CRUD - Update)
Actualiza teléfono, correo o dirección de un cliente.

##### `DELETE /api/clientes/{id}` (CRUD - Delete)
Elimina la ficha de un cliente del directorio.
* **Seguridad:** Requiere rol `ADMINISTRADOR`
* **Response 204 No Content / 404 Not Found**

---

#### 3.5 Módulo: Pagos y Caja (`/api/pagos`)

##### `POST /api/pagos` (CRUD - Create)
Registra un abono o liquidación total en counter, generando número único de recibo de caja y descontando el saldo de la reserva.
* **Seguridad:** Requiere autenticación
* **Body Request:**
  ```json
  {
    "idReserva": 1,
    "monto": 259000.00,
    "metodo": "EFECTIVO"
  }
  ```
* **Response 201 Created**

##### `GET /api/pagos/reserva/{idReserva}`
Lista el historial de recibos de caja asociados a una reserva.

---

#### 3.6 Módulo: Catálogos Maestros (`/api/tipos-habitacion` & `/api/cupones`)

##### `GET /api/tipos-habitacion`
Lista todos los tipos de suites con precios base y capacidades.

##### `GET /api/cupones/validar/{codigo}`
Valida si un cupón está activo y retorna su porcentaje o monto de descuento.
