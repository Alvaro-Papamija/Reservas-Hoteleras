# TRD - Sistema de Reservas Hoteleras

**Responsable:** Alvaro Andrés
**Versión del documento:** 1.0 (noviembre de 2026)
**Documento relacionado:** PRD.md

---

## 1. Stack tecnológico

| Componente | Tecnología |
|---|---|
| Frontend | React (con Vite), HTML y CSS |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| API | REST, formato JSON |
| Autenticación | JWT |
| Contraseñas | bcrypt |
| Validación | Zod en el backend; validación equivalente en formularios del frontend |
| Acceso a datos | Consultas parametrizadas (librería `pg`) o un ORM como Prisma |
| Control de versiones | Git + GitHub |
| Editor | VS Code |
| Diseño | Figma |
| Pruebas de API | Postman |
| Pruebas automatizadas | Jest + Supertest |
| Despliegue | Render (frontend y backend) con PostgreSQL administrado |

No se incorporan dependencias propietarias ni servicios que generen dependencia de un proveedor (vendor lock-in). Toda librería nueva debe justificarse en el README.

## 2. Arquitectura de software

### 2.1 Alternativas evaluadas

| # | Alternativa | Observación |
|---|---|---|
| 1 | **Monolito modular en tres capas** (frontend / API / base de datos) | Simple, suficiente para el alcance y el tiempo. **Seleccionada.** |
| 2 | Monolito con renderizado en servidor (Next.js) | Reduce piezas, pero cambia el stack acordado y la separación frontend/backend. |
| 3 | Microservicios (usuarios, habitaciones, reservas) | Sobredimensionado para 4 semanas y un solo desarrollador. |
| 4 | Serverless (funciones en la nube + base administrada) | Complica pruebas locales y el control transaccional. |
| 5 | Backend como servicio (Firebase o Supabase) | Rápido, pero introduce dependencia del proveedor y menor control de reglas como la no superposición. |

### 2.2 Decisión

Arquitectura de tres capas con un backend monolítico organizado por módulos:

```
FRONTEND (React)
      │  HTTPS / JSON
      ▼
BACKEND (Node.js + Express, API REST)
      │
      ▼
BASE DE DATOS (PostgreSQL)
```

Regla obligatoria: el frontend no se conecta directamente a PostgreSQL.

### 2.3 Organización interna del backend

Cada módulo (auth, habitaciones, tipos, clientes, reservas, reportes) se separa en rutas, controladores, servicios (reglas de negocio) y acceso a datos. La lógica de negocio vive en los servicios, no en los controladores.

### 2.4 Estructura del repositorio

```
sistema-reservas-hotel/
├── frontend/
├── backend/
├── database/
├── docs/
├── tests/
├── .gitignore
├── README.md
└── package.json
```

## 3. Modelo de datos y persistencia

### 3.1 Motor

PostgreSQL. Se elige por su integridad referencial, soporte de transacciones y, sobre todo, por poder imponer la regla de no superposición directamente en la base de datos.

### 3.2 Diagrama entidad-relación (primero el ERD)

```
USUARIO 1 ──── 1 CLIENTE
CLIENTE 1 ──── N RESERVA
HABITACION 1 ──── N RESERVA
TIPO_HABITACION 1 ──── N HABITACION
```

### 3.3 Tablas

**USUARIO**

| Campo | Tipo | Notas |
|---|---|---|
| id_usuario | serial, PK | |
| nombre | varchar(100) | obligatorio |
| correo | varchar(150) | único, obligatorio |
| password | varchar(255) | hash bcrypt |
| rol | varchar(20) | ADMINISTRADOR o CLIENTE |
| estado | boolean | activo / inactivo |

**CLIENTE**

| Campo | Tipo | Notas |
|---|---|---|
| id_cliente | serial, PK | |
| id_usuario | integer, FK a USUARIO | único (relación 1 a 1) |
| apellido | varchar(100) | |
| documento | varchar(20) | único |
| telefono | varchar(20) | |
| direccion | varchar(200) | opcional |
| fecha_registro | timestamp | por defecto la fecha actual |

**TIPO_HABITACION**

| Campo | Tipo | Notas |
|---|---|---|
| id_tipo | serial, PK | |
| nombre | varchar(50) | único (Individual, Doble, Triple, Familiar, Suite) |
| descripcion | text | |
| capacidad | smallint | mayor que 0 |
| precio_base | numeric(12,2) | mayor que 0 |

**HABITACION**

| Campo | Tipo | Notas |
|---|---|---|
| id_habitacion | serial, PK | |
| id_tipo | integer, FK a TIPO_HABITACION | |
| numero | varchar(10) | único |
| piso | smallint | |
| estado | varchar(20) | DISPONIBLE, RESERVADA, OCUPADA, MANTENIMIENTO |
| descripcion | text | |
| imagen | varchar(255) | ruta o URL |
| servicios | text[] | por ejemplo Wi-Fi, TV, baño privado |
| activa | boolean | para desactivar sin borrar |

**RESERVA**

| Campo | Tipo | Notas |
|---|---|---|
| id_reserva | serial, PK | |
| codigo | varchar(12) | único, legible (por ejemplo `RH-20261215-0042`) |
| id_cliente | integer, FK a CLIENTE | |
| id_habitacion | integer, FK a HABITACION | |
| fecha_entrada | date | |
| fecha_salida | date | debe ser mayor que fecha_entrada |
| cantidad_huespedes | smallint | mayor que 0 |
| precio_noche | numeric(12,2) | copiado de la habitación al reservar |
| cantidad_noches | smallint | calculado en el backend |
| total | numeric(12,2) | calculado en el backend |
| estado | varchar(20) | PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA |
| fecha_creacion | timestamp | por defecto la fecha actual |

### 3.4 Garantía contra reservas superpuestas

Se aplica en dos niveles:

1. **Base de datos:** una restricción de exclusión (extensión `btree_gist`) sobre `id_habitacion` y el rango de fechas `[fecha_entrada, fecha_salida)`, aplicable solo a reservas en estado PENDIENTE o CONFIRMADA. Así, aun con dos solicitudes simultáneas, PostgreSQL rechaza la segunda.
2. **Backend:** verificación previa dentro de una transacción para devolver un mensaje de error claro (HTTP 409) en lugar de un error genérico.

La fecha de salida se trata como límite exclusivo: una reserva que termina el 15/12 no choca con otra que inicia el 15/12.

### 3.5 Disponibilidad y estado de la habitación

La disponibilidad por fechas se calcula consultando las reservas, no el campo `estado` de la habitación. El campo `estado` refleja la situación operativa actual; solo MANTENIMIENTO (y habitaciones inactivas) excluye una habitación de la búsqueda.

### 3.6 Políticas de seguridad y migraciones

Opciones consideradas:

| # | Opción |
|---|---|
| 1 | Control de acceso en la capa de aplicación (middleware de roles y comprobación de propiedad) |
| 2 | Row Level Security de PostgreSQL |
| 3 | Rol de base de datos con privilegios mínimos para la aplicación |
| 4 | Migraciones versionadas y reversibles |
| 5 | Copias de seguridad automáticas del proveedor |

**Selección:** 1, 3, 4 y 5. La autorización se resuelve en el backend; la aplicación se conecta con un usuario de base de datos sin privilegios de superusuario; el esquema se gestiona con migraciones versionadas almacenadas en `database/`. Row Level Security queda como mejora futura.

Datos iniciales (semilla) para pruebas: 1 administrador, 2 clientes de prueba, 5 tipos de habitación y 30 habitaciones distribuidas en 3 pisos.

## 4. API REST

### 4.1 Endpoints

**Autenticación**
```
POST   /api/auth/register
POST   /api/auth/login
```

**Habitaciones**
```
GET    /api/habitaciones
GET    /api/habitaciones/disponibles
GET    /api/habitaciones/:id
POST   /api/habitaciones                (ADMINISTRADOR)
PUT    /api/habitaciones/:id            (ADMINISTRADOR)
DELETE /api/habitaciones/:id            (ADMINISTRADOR, desactivación lógica)
```
La ruta `/disponibles` debe declararse antes de `/:id` para que no se interprete como un identificador.

**Tipos de habitación**
```
GET    /api/tipos
POST   /api/tipos                       (ADMINISTRADOR)
PUT    /api/tipos/:id                   (ADMINISTRADOR)
```

**Clientes**
```
GET    /api/clientes                    (ADMINISTRADOR)
GET    /api/clientes/:id                (ADMINISTRADOR o el propio cliente)
PUT    /api/clientes/:id                (ADMINISTRADOR o el propio cliente)
```

**Reservas**
```
GET    /api/reservas                    (ADMINISTRADOR: todas; CLIENTE: solo las suyas)
GET    /api/reservas/:id
POST   /api/reservas
PUT    /api/reservas/:id                (ADMINISTRADOR)
PATCH  /api/reservas/:id/estado         (cambio de estado y cancelación)
DELETE /api/reservas/:id                (ADMINISTRADOR; solo reservas sin historial relevante)
```
La cancelación se realiza cambiando el estado a CANCELADA, no eliminando el registro.

**Reportes**
```
GET    /api/reportes/dashboard          (ADMINISTRADOR)
GET    /api/reportes/reservas           (ADMINISTRADOR)
GET    /api/reportes/ocupacion          (ADMINISTRADOR)
GET    /api/reportes/ingresos           (ADMINISTRADOR)
```

### 4.2 Convenciones

- Códigos HTTP: 200, 201, 400 (datos inválidos), 401 (sin sesión), 403 (sin permiso), 404, 409 (conflicto, por ejemplo superposición) y 500.
- Respuestas de error con estructura uniforme: código, mensaje y detalle por campo cuando aplique.
- La API se documenta en la colección de Postman y en `docs/`.

## 5. Integraciones y seguridad ("cliente limpio")

### 5.1 Servicios externos

Opciones consideradas:

| # | Servicio |
|---|---|
| 1 | Ninguno (MVP autocontenido) |
| 2 | Servicio de correo para confirmaciones (SMTP / Resend) |
| 3 | Almacenamiento de imágenes (Cloudinary) |
| 4 | Autenticación con Google (OAuth) |
| 5 | Pasarela de pagos |

**Selección:** el MVP funciona sin servicios externos (opción 1). El correo de confirmación (opción 2) queda como funcionalidad adicional de nivel 1. Las imágenes se sirven desde el propio despliegue. La pasarela de pagos está fuera del alcance.

### 5.2 Protección de credenciales

Opciones consideradas:

| # | Mecanismo |
|---|---|
| 1 | Variables de entorno y archivo `.env` excluido del repositorio |
| 2 | Variables secretas del proveedor de despliegue |
| 3 | Gestor de secretos dedicado |
| 4 | Backend como intermediario único (patrón BFF) |
| 5 | Rotación periódica de secretos |

**Selección:** 1, 2 y 4. En desarrollo se usa `.env`; en producción, las variables secretas de Render. El frontend solo conoce la URL pública de la API; nunca contiene claves ni la cadena de conexión.

Variables de entorno: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`.

### 5.3 Medidas mínimas de seguridad

- Hash de contraseñas con bcrypt (factor de costo 10 o superior).
- JWT con expiración de 8 horas; el token se envía en el encabezado `Authorization`.
- Middleware de autenticación y de autorización por rol en todas las rutas protegidas.
- Comprobación de propiedad: un cliente solo accede a sus propios datos y reservas.
- Consultas parametrizadas para evitar inyección SQL.
- CORS restringido al dominio del frontend; cabeceras de seguridad con Helmet.
- Límite de intentos de inicio de sesión (limitador de tasa).
- HTTPS obligatorio en producción.
- El `.env` y cualquier credencial nunca se suben a GitHub.

## 6. Estrategia de pruebas

### 6.1 Cobertura

Opciones consideradas:

| # | Tipo de prueba |
|---|---|
| 1 | Pruebas unitarias de servicios (Jest) |
| 2 | Pruebas de integración de la API (Jest + Supertest) con base de datos de prueba |
| 3 | Pruebas manuales de la API con colección de Postman |
| 4 | Pruebas E2E del flujo del cliente (Playwright) |
| 5 | Pruebas de carga básicas |

**Selección:** 1, 2 y 3 como obligatorias; la 4 se aplica al flujo principal si el tiempo lo permite. Prioridad de cobertura: reglas de reservas, cálculo de precio, autenticación y permisos.

### 6.2 Esquemas de validación

Se usa **Zod** en el backend para validar cuerpo, parámetros y consultas de cada endpoint (correo válido, contraseña con reglas mínimas, fechas ISO, enteros positivos, valores permitidos de estado). El frontend replica las validaciones básicas para dar respuesta inmediata, pero no reemplaza las del servidor.

### 6.3 Entorno de pruebas

Base de datos PostgreSQL separada para pruebas, reiniciada con datos semilla antes de cada ejecución. Las pruebas de reservas incluyen un caso de concurrencia (dos solicitudes simultáneas sobre la misma habitación).

## 7. Despliegue, DevOps y observabilidad

### 7.1 Alojamiento

Opciones consideradas:

| # | Opción |
|---|---|
| 1 | Render (servicio web + PostgreSQL administrado) |
| 2 | Railway |
| 3 | VPS con Docker Compose |
| 4 | Cloud Run + base de datos administrada |
| 5 | Vercel (frontend) + Render (backend) |

**Selección:** Render para frontend, backend y base de datos (opción 1), con Railway o VPS como alternativas si el plan gratuito resulta insuficiente.

### 7.2 Integración y entrega

- Repositorio en GitHub con ramas por funcionalidad y Pull Requests hacia `main`.
- Commits convencionales (`feat:`, `fix:`, `test:`, `docs:`).
- GitHub Actions ejecuta lint y pruebas en cada Pull Request.
- Despliegue automático desde `main`.

### 7.3 Observabilidad

- Registros estructurados (JSON) con nivel, ruta, código de respuesta y tiempo de ejecución.
- Manejo centralizado de errores en Express.
- Endpoint `GET /api/salud` para verificación de disponibilidad.
- Monitoreo del servicio con el panel del proveedor y un chequeo externo gratuito (por ejemplo UptimeRobot).
- Copias de seguridad de la base de datos según el plan del proveedor.

## 8. Restricciones para asistentes de IA

- No generar código fuera del alcance de la tarea indicada.
- No modificar archivos ni módulos no mencionados en la tarea.
- No añadir dependencias sin autorización.
- No escribir secretos ni cadenas de conexión en el código.
- Todo código generado debe ser comprendido y explicable por Alvaro durante la sustentación; se mantiene una bitácora de uso de IA.
