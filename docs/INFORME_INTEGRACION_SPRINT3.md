# INFORME TÉCNICO DE INTEGRACIÓN FRONTEND - BACKEND (SPRINT 3)
## APLICACIÓN INTEGRADA - ALBORADA HOTEL BOUTIQUE

---

### 1. Resumen de la Integración

La aplicación **Hotel Alborada Boutique** funciona como un ecosistema empresarial integrado de dos capas (Frontend SPA + Backend REST API) que se comunican de forma transparente a través de un proxy inverso y contratos de datos inmutables.

```
+-----------------------------------------------------------------------------------+
|                           FRONTEND REACT 19 (SPA)                                 |
|   - Catálogo de Habitaciones     - Checkout & Pagos         - Portal Mis Reservas |
|   - Dashboard Administrativo     - Front-Desk Check-In      - Calendario Ocupación|
+-----------------------------------------+-----------------------------------------+
                                          | Invocaciones fetch() con Bearer JWT
                                          v
+-----------------------------------------------------------------------------------+
|                        VITE REVERSE PROXY (/api/*)                                |
|   Reenvía solicitudes a http://127.0.0.1:8080 con control de CORS y timeouts     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                     BACKEND SPRING BOOT 3.3.5 REST API                            |
|   - AuthController (/api/auth)          - HabitacionController (/api/habitaciones)|
|   - ReservaController (/api/reservas)   - ClienteController (/api/clientes)       |
|   - PagoController (/api/pagos)         - CuponController (/api/cupones)          |
+-----------------------------------------+-----------------------------------------+
                                          | Spring Data JPA / Hibernate
                                          v
+-----------------------------------------------------------------------------------+
|                    BASE DE DATOS RELACIONAL (POSTGRESQL 16 / H2)                  |
|   - usuarios   - habitaciones   - reservas   - clientes   - pagos   - cupones     |
+-----------------------------------------------------------------------------------+
```

---

### 2. Matriz de Endpoints Integrados entre UI y Backend

| Módulo | Endpoint REST | Método HTTP | Componente Frontend que lo consume | Acción en la UI |
| :--- | :--- | :---: | :--- | :--- |
| **Salud** | `/api/habitaciones/salud` | `GET` | `hotelApiService.ts` | Diagnóstico de conectividad con la base de datos. |
| **Habitaciones** | `/api/habitaciones` | `GET` | `HotelContext.tsx` | Carga inicial del catálogo de habitaciones físicas. |
| **Disponibilidad**| `/api/habitaciones/disponibles` | `GET` | `hotelApiService.ts` | Búsqueda filtrada por fechas y número de huéspedes. |
| **Habitaciones** | `/api/habitaciones/{id}/estado`| `PATCH` | `AdminRoomsView.tsx` | Cambio rápido de estado (Disponible, Ocupada, Mantenimiento). |
| **Habitaciones** | `/api/habitaciones` | `POST` | `AdminRoomsView.tsx` | Creación de nuevas habitaciones en el inventario. |
| **Habitaciones** | `/api/habitaciones/{id}` | `DELETE`| `AdminRoomsView.tsx` | Eliminación física de habitaciones por el administrador. |
| **Autenticación** | `/api/auth/login` | `POST` | `AuthModal.tsx` | Inicio de sesión, validación de hash BCrypt y obtención de JWT. |
| **Autenticación** | `/api/auth/register` | `POST` | `AuthModal.tsx` | Registro de nuevos clientes con rol `CLIENTE`. |
| **Autenticación** | `/api/auth/me` | `GET` | `HotelContext.tsx` | Validación de la sesión activa al recargar la aplicación. |
| **Autenticación** | `/api/auth/logout` | `POST` | `Navbar.tsx` | Invalidación y revocación de token en servidor. |
| **Reservas** | `/api/reservas` | `POST` | `BookingModal.tsx` | Confirmación de reserva y expedición del voucher oficial. |
| **Reservas** | `/api/reservas` | `GET` | `AdminReservationsView.tsx` | Carga de todos los expedientes en el panel de Front-Desk. |
| **Reservas** | `/api/reservas/cliente/{id}` | `GET` | `MyReservationsView.tsx` | Historial de reservas asociadas al huésped autenticado. |
| **Reservas** | `/api/reservas/{id}/fechas` | `PUT` | `AdminReservationsView.tsx` | Reprogramación de fechas de estancia sin solapamiento. |
| **Reservas** | `/api/reservas/{id}/checkin` | `PATCH` | `AdminReservationsView.tsx` | Registro de llegada y asignación de llave/tarjeta RFID. |
| **Reservas** | `/api/reservas/{id}/cancelar`| `PATCH` | `MyReservationsView.tsx` | Cancelación con verificación de política de 48h. |
| **Clientes** | `/api/clientes` | `GET` | `AdminClientsView.tsx` | Carga del directorio general de huéspedes. |
| **Clientes** | `/api/clientes/documento/{doc}`| `GET` | `BookingModal.tsx` | Autocompletado de datos para huéspedes frecuentes. |
| **Pagos** | `/api/pagos` | `POST` | `BookingModal.tsx` / `AdminReservationsView.tsx` | Registro de abonos y liquidación total con recibo de caja. |
| **Pagos** | `/api/pagos/reserva/{id}` | `GET` | `AdminReservationsView.tsx` | Consulta de recibos de caja asociados a la reserva. |
| **Cupones** | `/api/cupones/validar/{cod}` | `GET` | `BookingModal.tsx` | Validación en vivo de cupones de descuento. |

---

### 3. Guía de Ejecución de la Aplicación Integrada

Para ejecutar ambos extremos del sistema en tu entorno local:

#### Terminal 1: Iniciar Backend Spring Boot
```powershell
cd backend
mvn spring-boot:run
```
* Servidor activo en: `http://localhost:8080`
* Documentación Swagger UI en: `http://localhost:8080/swagger-ui.html`
* Consola H2 (si se usa memoria): `http://localhost:8080/h2-console`

#### Terminal 2: Iniciar Frontend React
```powershell
npm run dev
```
* Aplicación web activa en: `http://localhost:3000`
* La comunicación con el backend se realiza automáticamente mediante el proxy `/api` hacia `http://localhost:8080`.

---

### 4. Evidencia de Ejecución de Pruebas de Integración

Las 14 pruebas de integración dedicadas en [src/__tests__/integration_sprint3_api.test.ts](file:///c:/Users/SENA/.gemini/antigravity/scratch/Reservas-Hoteleras/src/__tests__/integration_sprint3_api.test.ts) validan el ciclo de vida completo de extremo a extremo:
1. `validateEmail`: Bloqueo de inyecciones y sintaxis inválidas.
2. `validateColombianPhone`: Aceptación de prefijos E.164 (+57) y móviles de 10 dígitos.
3. `validateDocumento`: Verificación de Cédula de Ciudadanía colombiana, CE y Pasaporte.
4. `validateReservationDates`: Cálculo de noches y rechazo de rangos invertidos o pasados.
5. `validateGuestCapacity`: Bloqueo de sobrecupo frente a la capacidad de la suite.
6. `validateLuhnCard`: Verificación de tarjetas bancarias mediante el **Algoritmo de Luhn** (Módulo 10).
7. `validateCardExpiry`: Rechazo de plásticos vencidos.
8. `validateCardCVV`: Longitud dinámica según franquicia (Visa/Mastercard 3 dígitos, Amex 4).
9. `validatePaymentAmount`: Restricción de montos positivos y tope contra el saldo pendiente.
10. `hotelApi.crearReserva`: Serialización de DTOs y respuesta 201 Created.
11. `hotelApi.registrarPago`: Retorno y validación del recibo oficial de caja.
12. `hotelApi.getHabitacionesDisponibles`: Filtrado de habitaciones por parámetros de consulta.
13. Manejo de excepciones de red y traducción de conflictos HTTP 409 Conflict.
14. Diagnóstico de salud de la API (`checkHealth`).
