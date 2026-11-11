# User Flow - Sistema de Reservas Hoteleras

**Responsable:** Alvaro Andrés
**Versión del documento:** 1.0 (noviembre de 2026)
**Documentos relacionados:** PRD.md, TRD.md, PLAN.md

---

## 1. Punto de partida y estado inicial

### 1.1 Cómo llega el usuario

- **Cliente:** entra por la página de inicio pública del hotel (enlace directo, búsqueda en Internet o enlace compartido por redes y WhatsApp).
- **Administrador:** entra por la pantalla de inicio de sesión y, al autenticarse, es redirigido a su dashboard.

### 1.2 Visitante anónimo frente a usuario autenticado

| Elemento | Visitante anónimo | Cliente autenticado | Administrador |
|---|---|---|---|
| Página de inicio y buscador | Sí | Sí | Sí |
| Catálogo y detalle de habitaciones | Sí | Sí | Sí |
| Consulta de disponibilidad | Sí | Sí | Sí |
| Botón "Reservar" | Visible; al pulsarlo pide iniciar sesión | Activo | Activo |
| Menú superior | Inicio, Habitaciones, Iniciar sesión, Registrarse | Inicio, Habitaciones, Mis reservas, Perfil, Cerrar sesión | Acceso al panel administrativo |
| Mis reservas y Perfil | No | Sí | No aplica |
| Dashboard, clientes, reportes | No | No | Sí |

### 1.3 Reglas de redirección por sesión

- Visitante que intenta abrir una ruta protegida: se envía a Login y, tras autenticarse, se le devuelve a la ruta original.
- Cliente que intenta abrir una ruta de administrador: se muestra pantalla "Acceso no autorizado" con botón para volver al inicio.
- Token vencido: se cierra la sesión, se muestra el aviso "Tu sesión expiró" y se redirige a Login.
- Tras iniciar sesión: cliente va a la página donde estaba (o a Inicio); administrador va al Dashboard.

## 2. Camino crítico (happy path)

### 2.1 Cliente

```
Inicio
  │
  ▼
Buscar disponibilidad (entrada, salida, huéspedes)
  │
  ▼
Resultados de habitaciones disponibles
  │
  ▼
Detalle de habitación
  │
  ▼
Reservar ── (si no hay sesión) ──► Login / Registro ──┐
  │                                                   │
  ◄───────────────────────────────────────────────────┘
  ▼
Resumen de reserva (fechas, huéspedes, precio por noche, noches, total)
  │
  ▼
Confirmar reserva
  │
  ▼
Pantalla de confirmación (código de reserva, estado PENDIENTE)
  │
  ▼
Mis reservas
```

**Ejemplo con datos reales de prueba:**

1. Laura Gómez entra a Inicio e ingresa: entrada 15/12/2026, salida 18/12/2026, 2 huéspedes.
2. El sistema muestra las habitaciones disponibles con capacidad para 2 personas, por ejemplo la habitación 204 (Doble, $180.000 por noche).
3. Laura abre el detalle, revisa servicios (Wi-Fi, TV, baño privado) y pulsa "Reservar".
4. Como no ha iniciado sesión, se le envía a Login; se registra y vuelve automáticamente al resumen.
5. El resumen muestra 3 noches x $180.000 = **$540.000**.
6. Laura confirma. El sistema crea la reserva en estado PENDIENTE y muestra el código (por ejemplo `RH-20261215-0042`).
7. Desde "Mis reservas" puede consultar la reserva o cancelarla (hasta 48 horas antes de la entrada).

### 2.2 Administrador

```
Login
  │
  ▼
Dashboard
  │
  ├── Habitaciones ── crear / editar / cambiar estado / desactivar
  ├── Tipos de habitación ── crear / editar precios
  ├── Clientes ── consultar y ver historial de reservas
  ├── Reservas ── buscar / confirmar / cancelar / finalizar
  └── Reportes ── reservas, ocupación, ingresos
```

**Ejemplo:** el administrador inicia sesión, ve en el dashboard 30 habitaciones (18 disponibles, 7 ocupadas, 5 en mantenimiento) y 42 reservas del mes. Entra a "Reservas", filtra por estado PENDIENTE, abre la reserva `RH-20261215-0042` y la pasa a CONFIRMADA.

### 2.3 Estados de una reserva

```
PENDIENTE ──► CONFIRMADA ──► FINALIZADA
    │              │
    └──────┬───────┘
           ▼
       CANCELADA
```

## 3. Bifurcaciones y escenarios alternativos

| Situación | Reacción de la navegación |
|---|---|
| Fecha de salida igual o anterior a la de entrada | El buscador marca el campo con error y no ejecuta la consulta. |
| Fecha de entrada en el pasado | Mensaje de error en el campo; no se ejecuta la consulta. |
| No hay habitaciones disponibles para las fechas | Pantalla de resultados vacía con mensaje y botón "Cambiar fechas". |
| Visitante pulsa "Reservar" sin sesión | Redirige a Login conservando la selección; tras autenticarse vuelve al resumen. |
| Correo ya registrado en el registro | Mensaje junto al campo y enlace a "Iniciar sesión". |
| Contraseña incorrecta en el login | Mensaje genérico "Correo o contraseña incorrectos"; el usuario permanece en Login. |
| Demasiados intentos fallidos de login | Mensaje de espera temporal y enlace a recuperación de contraseña (si está disponible). |
| Otra persona reservó la habitación mientras el cliente decidía (error 409) | Mensaje "La habitación ya no está disponible para esas fechas" y botón "Ver otras opciones", que vuelve a los resultados con las mismas fechas. |
| El cliente cancela el formulario de reserva a mitad del camino | Se vuelve al detalle de la habitación sin crear la reserva; las fechas se conservan. |
| Cancelación fuera del plazo de 48 horas | El botón "Cancelar" aparece deshabilitado con la explicación; se sugiere contactar al hotel. |
| Habitación en MANTENIMIENTO | No aparece en los resultados. Si ya estaba abierta, se informa que no está disponible. |
| Número de huéspedes mayor a la capacidad | La habitación no se muestra en resultados; en el detalle se avisa la capacidad máxima. |
| Administrador intenta una transición de estado inválida | Mensaje explicando las transiciones permitidas; el estado no cambia. |
| Administrador intenta eliminar una habitación con reservas futuras | Se bloquea la acción y se ofrece desactivarla. |
| Error de red o del servidor (500) | Mensaje "No pudimos completar la operación. Intenta de nuevo" con botón "Reintentar"; no se pierde lo digitado. |
| Sesión expirada durante una operación | Se redirige a Login y, al volver, se retoma la pantalla anterior. |

## 4. Estados de la interfaz

### 4.1 Carga (loading)

- Listados (catálogo, reservas, clientes): tarjetas o filas "esqueleto" en gris mientras se consulta.
- Botones de acción (Buscar, Reservar, Confirmar, Guardar): quedan deshabilitados y muestran un indicador de progreso para evitar envíos duplicados.
- Dashboard y reportes: cada bloque de indicadores muestra su propio indicador de carga.

### 4.2 Vacío (empty states)

| Pantalla | Mensaje | Acción sugerida |
|---|---|---|
| Resultados de disponibilidad | "No hay habitaciones disponibles para esas fechas." | Cambiar fechas |
| Mis reservas | "Aún no tienes reservas." | Buscar habitaciones |
| Catálogo con filtros sin coincidencias | "Ninguna habitación coincide con los filtros." | Limpiar filtros |
| Clientes (administrador) | "Todavía no hay clientes registrados." | - |
| Reservas (administrador) | "No hay reservas con esos criterios." | Limpiar búsqueda |
| Reportes sin datos del período | "No hay datos para el período seleccionado." | Cambiar período |

### 4.3 Errores de validación

- Mensaje en texto breve debajo del campo afectado, con borde del campo resaltado.
- Los errores se muestran al salir del campo y al enviar el formulario.
- No se borra lo que el usuario escribió.

Mensajes definidos:

| Campo | Mensaje |
|---|---|
| Correo | "Ingresa un correo válido." |
| Correo duplicado | "Este correo ya está registrado." |
| Contraseña | "Mínimo 8 caracteres, con letras y números." |
| Documento | "Ingresa un documento válido." |
| Teléfono | "Ingresa un número de teléfono válido." |
| Fecha de salida | "La salida debe ser posterior a la entrada." |
| Fecha de entrada | "La entrada no puede ser anterior a hoy." |
| Huéspedes | "El número de huéspedes debe ser mayor a cero." |
| Precio por noche | "Ingresa un valor mayor a cero." |
| Número de habitación | "Este número de habitación ya existe." |

### 4.4 Errores generales

- Notificación breve en la parte superior para errores de red y del servidor.
- Pantallas dedicadas para 404 ("Página no encontrada") y 403 ("Acceso no autorizado"), cada una con botón para volver al inicio.

## 5. Salida y cierre del flujo

### 5.1 Reserva exitosa (cliente)

- **Pantalla final:** confirmación con el código de reserva, nombre de la habitación, fechas, número de huéspedes, total y estado (PENDIENTE).
- **Acciones:** "Ver mis reservas" (principal) y "Seguir explorando habitaciones" (secundaria).
- **Redirección:** si el cliente no actúa, permanece en la pantalla de confirmación; no se redirige automáticamente para que pueda anotar el código.

### 5.2 Cancelación exitosa

- Mensaje "Tu reserva fue cancelada" y regreso a "Mis reservas", donde la reserva aparece con estado CANCELADA.
- Invitación secundaria: "Buscar otras fechas".

### 5.3 Acciones del administrador

- Tras crear o editar una habitación, tipo o reserva: notificación de éxito y regreso al listado correspondiente con el cambio visible.
- Tras cambiar el estado de una reserva: el listado se actualiza y el nuevo estado queda resaltado.

### 5.4 Cierre de sesión

- Se elimina el token, se muestra el aviso "Sesión cerrada" y se redirige a la página de inicio pública.

## 6. Mapa de pantallas

**Cliente:** Inicio, Habitaciones, Detalle de habitación, Buscar disponibilidad, Reserva, Confirmación, Mis reservas, Perfil, Login y Registro.

**Administrador:** Dashboard, Habitaciones, Tipos de habitación, Clientes, Reservas, Reportes y Configuración.

**Comunes:** 403 (acceso no autorizado) y 404 (página no encontrada).

## 7. Consideraciones de diseño

- Interfaz moderna, limpia y fácil de usar, adaptada a computador y celular.
- En celular, el menú se muestra colapsado y el buscador de disponibilidad ocupa el ancho completo.
- Precios con formato colombiano (`$180.000`) y fechas en formato día/mes/año.
