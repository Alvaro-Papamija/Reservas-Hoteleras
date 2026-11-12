# USER FLOW - Flujos de Usuario y Experiencia

**Hotel:** Alborada Hotel Boutique  
**Responsable:** Alvaro Andrés  
**Versión del documento:** 1.0 (Noviembre de 2026)  
**Documentos relacionados:** [PRD.md](./PRD.md), [TRD.md](./TRD.md)

---

## 1. Experiencia de Usuario y Puntos de Partida

### 1.1 Matriz de Accesibilidad por Perfil

| Elemento o Función | Visitante Anónimo | Cliente Autenticado | Administrador |
|---|:---:|:---:|:---:|
| Página de inicio y buscador de fechas | Sí | Sí | Sí |
| Catálogo visual de habitaciones y fotos | Sí | Sí | Sí |
| Consulta en vivo de disponibilidad | Sí | Sí | Sí |
| Botón "Reservar" | Solicita iniciar sesión | Activo (reserva directa) | Activo |
| Mis Reservas | No | Sí (solo sus reservas) | No aplica |
| Panel Administrativo (Dashboard, Habitaciones, Clientes, Reportes) | No | No (acceso bloqueado) | Sí (completo) |

---

## 2. Camino Crítico del Cliente (Happy Path)

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente
    participant UI as Frontend (React / Vite)
    participant API as Backend (Express API)
    participant DB as PostgreSQL

    C->>UI: Ingresa fechas (ej. 15/12 a 18/12) y huéspedes (2)
    UI->>API: GET /api/habitaciones/disponibles?entrada=...&salida=...
    API->>DB: Consulta habitaciones con capacidad >= 2 y sin reservas solapadas
    DB-->>API: Habitaciones disponibles (ej. Habitación 204 Doble)
    API-->>UI: Retorna inventario disponible
    UI-->>C: Despliega tarjetas con fotos y precio COP ($180.000/noche)
    C->>UI: Selecciona habitación y pulsa "Reservar"
    UI-->>C: Modal de Reserva: Desglose (3 noches x $180.000 = $540.000)
    C->>UI: Confirma reserva con sus datos
    UI->>API: POST /api/reservas (con id_habitacion, fechas, huespedes)
    API->>DB: Bloqueo transaccional + Inserción con código único (ALB-XXXXX)
    DB-->>API: Reserva creada (Estado: PENDIENTE)
    API-->>UI: Retorna confirmación HTTP 201
    UI-->>C: Modal de Éxito con código oficial y botón a "Mis Reservas"
```

---

## 3. Máquina de Estados de Reservas (RN06)

El ciclo de vida de una reserva sigue una máquina de estados estricta para garantizar la integridad operativa del hotel:

```mermaid
stateDiagram-v2
    [*] --> PENDIENTE : Cliente realiza reserva
    PENDIENTE --> CONFIRMADA : Administrador confirma o recibe pago
    PENDIENTE --> CANCELADA : Cliente (<= 48h) o Administrador
    CONFIRMADA --> FINALIZADA : Check-out realizado con éxito
    CONFIRMADA --> CANCELADA : Administrador o Cliente (<= 48h)
    CANCELADA --> [*]
    FINALIZADA --> [*]
```

### Reglas de Transición
1. **PENDIENTE $\rightarrow$ CONFIRMADA**: La reserva es validada por el hotel.
2. **CONFIRMADA $\rightarrow$ FINALIZADA**: El huésped completa su estadía y realiza check-out.
3. **PENDIENTE / CONFIRMADA $\rightarrow$ CANCELADA**:
   - Por el cliente: Permitido únicamente si faltan más de 48 horas para la fecha de check-in (15:00 del día de entrada).
   - Por el administrador: Permitido en cualquier momento por causas justificadas.
4. **Liberación de inventario**: En el momento exacto en que una reserva pasa a `CANCELADA`, la habitación queda disponible para ser reservada por otros clientes.

---

## 4. Flujo Operativo del Administrador

```mermaid
flowchart TD
    A[Inicio de Sesión como ADMINISTRADOR] --> B[Dashboard General]
    B --> C{Acción Seleccionada}
    C -->|Métricas| D[Revisar Ocupación e Ingresos COP]
    C -->|Habitaciones| E[Crear, Editar o Poner en Mantenimiento]
    C -->|Reservas| F[Confirmar, Check-in, Finalizar o Cancelar]
    C -->|Directorio| G[Consultar Clientes y Contactos]

    E --> H[Inventario actualizado en tiempo real]
    F --> I[Disponibilidad recalculada automáticamente]
```
