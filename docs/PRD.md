# PRD - Sistema de Reservas Hoteleras

**Hotel:** Alborada Hotel Boutique  
**Responsable:** Alvaro Andrés  
**Tipo de aplicación:** Aplicación web responsive  
**Duración del proyecto:** 4 semanas  
**Versión del documento:** 1.0 (Noviembre de 2026)  
**Documentos relacionados:** [TRD.md](./TRD.md), [USER_FLOW.md](./USER_FLOW.md), [PLAN.md](./PLAN.md), [QA_TEST_REPORT.md](./QA_TEST_REPORT.md)

---

## 1. Resumen del producto

Plataforma web que permite a un hotel boutique administrar sus habitaciones, clientes y reservas desde un solo lugar, y que permite a un cliente consultar las habitaciones disponibles por fechas y reservar en línea sin necesidad de intermediarios manuales (llamadas o WhatsApp).

## 2. Problema y propuesta de valor

### 2.1 Problema
Muchos hoteles pequeños y boutique gestionan sus reservas mediante llamadas, mensajería, hojas de cálculo o registros manuales. Esto genera:
- Reservas duplicadas para una misma habitación.
- Errores en las fechas de entrada y salida.
- Falta de control sobre las habitaciones disponibles y su estado operativo.
- Dificultad para consultar el historial de reservas.
- Información de clientes dispersa y desorganizada.
- Pérdida de tiempo en procesos administrativos.

### 2.2 Propuesta de valor
Centralizar habitaciones, clientes y reservas en una plataforma web que impide por diseño las reservas superpuestas, calcula el precio automáticamente en el servidor y entrega al administrador una visión clara de la ocupación y los ingresos estimados.

### 2.3 Objetivo general
Desarrollar un sistema web para gestionar las reservas de un hotel, permitiendo administrar habitaciones, clientes y reservas, consultar disponibilidad y generar información básica para apoyar la gestión del establecimiento.

### 2.4 Objetivos específicos
1. Registrar y administrar las habitaciones del hotel.
2. Registrar y administrar la información de los clientes.
3. Consultar habitaciones disponibles según fechas y huéspedes.
4. Crear, modificar y cancelar reservas.
5. Evitar que una habitación se reserve dos veces en fechas que se crucen (RN01).
6. Consultar el estado de las reservas.
7. Autenticar a los usuarios con control de roles (RBAC).
8. Generar reportes básicos de reservas, ocupación e ingresos.
9. Ofrecer una interfaz responsive moderna y accesible.
10. Realizar y documentar pruebas funcionales y automatizadas.
11. Desplegar una versión funcional accesible desde Internet.

---

## 3. Métricas de éxito (KPIs)

| KPI | Meta para el MVP | Cómo se mide |
|---|---|---|
| Reservas superpuestas registradas | 0 | Consulta de integridad sobre la tabla de reservas y pruebas automatizadas |
| Tiempo de respuesta de operaciones principales | Menos de 3 s con carga normal | Postman y registros del servidor |
| Flujo completo del cliente (registro, búsqueda, reserva, consulta) | Se completa sin errores en 100 % de las pruebas | Plan de pruebas funcionales y suites E2E |
| Tiempo para crear una reserva | Menos de 2 minutos desde la búsqueda hasta la confirmación | Prueba con usuarios de ensayo |
| Requisitos funcionales implementados | 20 de 20 (RF01 a RF20) | Matriz de trazabilidad |
| Casos de prueba documentados que pasan | Al menos 90 % | Suite de pruebas Vitest |
| Disponibilidad del despliegue | URL pública activa al cierre de la semana 4 | Revisión manual y monitoreo básico |

---

## 4. Usuarios, roles y permisos

### 4.1 Usuarios finales
- **Cliente:** Persona que desea consultar habitaciones y reservar alojamiento (turistas, viajeros de negocios, parejas, familias).
- **Administrador:** Personal operativo y gerencial del hotel que gestiona el inventario, las reservas y consulta reportes.

### 4.2 Matriz de permisos (RBAC)

| Acción | Visitante | CLIENTE | ADMINISTRADOR |
|---|:---:|:---:|:---:|
| Ver catálogo de habitaciones | Sí | Sí | Sí |
| Consultar disponibilidad por fechas | Sí | Sí | Sí |
| Registrarse e iniciar sesión | Sí | - | - |
| Crear una reserva | No | Sí | Sí (a nombre de un cliente) |
| Ver sus propias reservas | No | Sí | Sí |
| Cancelar una reserva propia | No | Sí (según política) | Sí (cualquiera) |
| Ver todas las reservas | No | No | Sí |
| Confirmar o finalizar reservas | No | No | Sí |
| Crear y editar habitaciones y tipos | No | No | Sí |
| Cambiar el estado de una habitación | No | No | Sí |
| Gestionar precios y tarifas base | No | No | Sí |
| Consultar directorio de clientes | No | No | Sí |
| Ver dashboard y reportes | No | No | Sí |

---

## 5. Historias de usuario y criterios de aceptación

### HU01 - Registrar usuario
Como cliente, quiero registrarme en el sistema para poder realizar reservas.
- El correo debe tener formato válido.
- El correo no puede estar ya registrado; si lo está, se muestra un mensaje claro.
- La contraseña debe tener al menos 8 caracteres, con letras y números.
- Al registrarse se crean el usuario (rol CLIENTE) y su perfil de cliente.
- La contraseña se guarda únicamente como hash.

### HU02 - Iniciar y cerrar sesión
Como usuario registrado, quiero iniciar sesión para acceder a las funciones de mi rol.
- Con credenciales correctas se entrega un token de sesión y se redirige según el rol.
- Con credenciales incorrectas se muestra un mensaje genérico, sin revelar cuál dato falló.
- Al cerrar sesión se elimina el token del navegador.

### HU03 - Consultar habitaciones
Como cliente, quiero consultar las habitaciones del hotel para elegir una que se adapte a mis necesidades.
- Se muestra número, tipo, capacidad, precio por noche, servicios e imagen.
- Se puede filtrar por tipo, rango de precio, capacidad y servicios.
- Se puede ver el detalle de cada habitación.

### HU04 - Consultar disponibilidad
Como cliente, quiero indicar fecha de entrada, fecha de salida y número de huéspedes para ver solo las habitaciones disponibles.
- La fecha de salida debe ser posterior a la de entrada.
- La fecha de entrada no puede ser anterior a la fecha actual.
- Solo se muestran habitaciones con capacidad suficiente, sin reservas que se crucen con el intervalo y que no estén en MANTENIMIENTO.
- Si no hay resultados, se muestra un mensaje con la sugerencia de cambiar fechas.

### HU05 - Realizar reserva
Como cliente, quiero reservar una habitación para asegurar mi alojamiento durante las fechas seleccionadas.
- El sistema calcula noches y total en el servidor; el cliente no puede editarlos.
- La reserva se crea en estado PENDIENTE y guarda fecha de creación.
- Si otra reserva ocupó la habitación mientras el cliente decidía, el sistema rechaza la operación y ofrece volver a buscar.
- Se muestra un resumen con código de reserva, fechas, huéspedes y total.

### HU06 - Consultar mis reservas
Como cliente, quiero ver mis reservas y su estado para llevar control de mi viaje.
- Se listan solo las reservas del cliente autenticado.
- Cada reserva muestra habitación, fechas, total y estado.

### HU07 - Cancelar mi reserva
Como cliente, quiero cancelar una reserva cuando mis planes cambian.
- Solo se puede cancelar una reserva PENDIENTE o CONFIRMADA.
- La cancelación está permitida hasta 48 horas antes de la fecha de entrada.
- Al cancelar, la habitación queda libre para esas fechas.

### HU08 - Gestionar habitaciones
Como administrador, quiero registrar y modificar habitaciones para mantener actualizado el inventario.
- El número de habitación es único.
- Se pueden asociar tipo, piso, descripción, imagen y servicios.
- Una habitación con reservas futuras no se elimina; se desactiva.

### HU09 - Gestionar tipos de habitación y precios
Como administrador, quiero administrar los tipos de habitación y sus precios base para controlar la oferta.
- Cada tipo tiene nombre, descripción, capacidad y precio base.
- Un cambio de precio no altera reservas ya creadas (se conserva el precio por noche guardado en la reserva).

### HU10 - Gestionar reservas
Como administrador, quiero consultar todas las reservas y cambiar su estado para controlar la operación diaria.
- Se puede buscar por código de reserva y por nombre del cliente.
- Las transiciones válidas son PENDIENTE a CONFIRMADA, CONFIRMADA a FINALIZADA, y PENDIENTE o CONFIRMADA a CANCELADA.
- Cualquier otra transición es rechazada.

### HU11 - Gestionar estados de habitaciones
Como administrador, quiero cambiar el estado de una habitación (DISPONIBLE, RESERVADA, OCUPADA, MANTENIMIENTO) para reflejar su situación real.
- Una habitación en MANTENIMIENTO no aparece en la búsqueda de disponibilidad.

### HU12 - Consultar clientes
Como administrador, quiero consultar los clientes registrados y sus reservas para atenderlos mejor.
- Se muestran nombre, apellido, documento, teléfono, correo, fecha de registro y reservas realizadas.

### HU13 - Dashboard y reportes
Como administrador, quiero ver indicadores y reportes para tomar decisiones sobre la operación.
- El dashboard muestra total de habitaciones, disponibles, ocupadas, en mantenimiento, reservas del mes e ingresos estimados.
- Los reportes incluyen reservas por estado, porcentaje de ocupación, ingresos por período y habitaciones más reservadas.

---

## 6. Requisitos funcionales (RF)

| Código | Requisito |
|---|---|
| RF01 | El sistema deberá permitir registrar usuarios. |
| RF02 | El sistema deberá permitir iniciar sesión. |
| RF03 | El administrador deberá poder registrar habitaciones. |
| RF04 | El administrador deberá poder modificar habitaciones. |
| RF05 | El sistema deberá permitir consultar habitaciones. |
| RF06 | El sistema deberá permitir consultar disponibilidad por fechas. |
| RF07 | El cliente deberá poder realizar una reserva. |
| RF08 | El sistema deberá calcular automáticamente el costo total. |
| RF09 | El sistema deberá impedir reservas superpuestas. |
| RF10 | El cliente deberá poder consultar sus reservas. |
| RF11 | El cliente deberá poder cancelar una reserva. |
| RF12 | El administrador deberá poder consultar todas las reservas. |
| RF13 | El administrador deberá poder cambiar el estado de una reserva. |
| RF14 | El administrador deberá poder cambiar el estado de una habitación. |
| RF15 | El sistema deberá permitir consultar clientes. |
| RF16 | El sistema deberá permitir buscar habitaciones. |
| RF17 | El sistema deberá permitir filtrar habitaciones. |
| RF18 | El sistema deberá generar estadísticas básicas. |
| RF19 | El administrador deberá poder consultar reportes. |
| RF20 | El sistema deberá registrar la fecha de creación de las reservas. |

---

## 7. Requisitos no funcionales (RNF)

| Código | Requisito |
|---|---|
| RNF01 | Respuesta de las operaciones principales en menos de 3 segundos bajo carga normal. |
| RNF02 | Interfaz responsive para computador y celular. |
| RNF03 | Contraseñas almacenadas mediante hash bcrypt. |
| RNF04 | Autenticación y autorización por roles (RBAC). |
| RNF05 | Comunicación mediante HTTPS en producción. |
| RNF06 | API documentada. |
| RNF07 | Base de datos con integridad referencial. |
| RNF08 | Código organizado y mantenible bajo arquitectura de capas. |
| RNF09 | Control de versiones mediante Git y branching model (dev, qa, main). |
| RNF10 | Validación de datos en frontend y backend. |

---

## 8. Reglas de negocio (RN)

- **RN01 (Garantía de no superposición):** No puede existir más de una reserva activa (PENDIENTE o CONFIRMADA) para la misma habitación en fechas que se crucen. La fecha de salida es exclusiva: el intervalo es $[fecha\_entrada, fecha\_salida)$, por lo que una reserva que termina el 15/12 no choca con otra que empieza el 15/12.
- **RN02 (Cálculo de total):** El total de la reserva es precio por noche multiplicado por el número de noches, calculado siempre en el backend.
- **RN03 (Inmutabilidad histórica de tarifa):** El precio por noche se copia a la reserva en el momento de crearla; cambios futuros en el tipo de habitación no modifican reservas existentes.
- **RN04 (Capacidad máxima):** El número de huéspedes no puede superar la capacidad máxima de la habitación.
- **RN05 (Política de cancelación):** Una reserva solo puede cancelarla el cliente hasta 48 horas antes de la fecha de entrada. El administrador puede cancelar en cualquier momento.
- **RN06 (Máquina de estados):** Estados válidos: PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA. Transiciones permitidas:
  - PENDIENTE $\rightarrow$ CONFIRMADA
  - CONFIRMADA $\rightarrow$ FINALIZADA
  - PENDIENTE o CONFIRMADA $\rightarrow$ CANCELADA
- **RN07 (Mantenimiento):** Una habitación en MANTENIMIENTO o inactiva no se ofrece en la búsqueda de disponibilidad.
- **RN08 (Unicidad de cuenta):** Un correo electrónico solo puede pertenecer a un usuario registrado.

