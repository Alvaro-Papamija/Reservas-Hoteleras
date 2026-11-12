# PLAN - Hoja de Ruta y Cronograma de Desarrollo

**Hotel:** Alborada Hotel Boutique  
**Responsable:** Alvaro Andrés  
**Duración del proyecto:** 4 semanas  
**Versión del documento:** 1.0 (Noviembre de 2026)  
**Documentos relacionados:** [PRD.md](./PRD.md), [TRD.md](./TRD.md)

---

## 1. Alcance y Priorización

### Fase 1 - MVP (Semanas 1 a 4) - Núcleo Funcional
- Registro, inicio de sesión y control de roles (`ADMINISTRADOR` y `CLIENTE`).
- CRUD completo de habitaciones y tipos de habitación.
- Directorio de clientes para el personal del hotel.
- Catálogo interactivo de habitaciones con filtros por precio y comodidades.
- Motor de búsqueda de disponibilidad por rango de fechas y número de huéspedes.
- Creación de reservas con cálculo de tarifas en servidor y garantía de no superposición (RN01).
- Portal de huéspedes ("Mis Reservas") con política de cancelación (48 horas).
- Panel de control administrativo (KPIs de ocupación, matriz por pisos, reportes).
- Interfaz responsive adaptada a móviles y computadores.
- Suite de pruebas automatizadas y despliegue funcional en Internet.

### Fase 2 - Nice-to-Have (Próximas iteraciones)
- Envío automático de correo transaccional de confirmación (SMTP / Resend).
- Generación de comprobante de reserva en formato PDF con código QR.
- Galería fotográfica interactiva por habitación.
- Calendario visual tipo Gantt/Timeline para reservas en el panel administrativo.
- Recuperación de contraseña por correo.

### Fase 3 - Futuro y Extensiones
- Pasarela de pago en línea (Wompi, PayU, MercadoPago).
- Sincronización bidireccional con canales externos (Booking.com, Airbnb).
- Sistema de cupones de descuento y fidelización de huéspedes.
- Soporte para cadenas multi-hotel.

---

## 2. Hitos y Entregables por Semana

```
Semana 1: Diseño, Requisitos, UML y Base de Datos
  │
  ▼
Semana 2: Backend, PostgreSQL, Autenticación y API REST
  │
  ▼
Semana 3: Frontend React, Catálogo, Búsqueda e Integración
  │
  ▼
Semana 4: Pruebas Automatizadas (QA), Documentación y Despliegue
```

| Semana | Hito Principal | Entregables Clave | Estado |
|:---:|---|---|:---:|
| **Semana 1** | Análisis y Diseño de Arquitectura | PRD, TRD, User Flow, DER, Diagramas de Secuencia y Prototipo UI. | **Completado** |
| **Semana 2** | API y Base de Datos | Repositorio GitHub, Migraciones SQL, Semillas de datos, Endpoints de Autenticación y CRUDs. | **Completado** |
| **Semana 3** | Frontend y Flujos de Reserva | Catálogo responsivo, Motor de disponibilidad, Modal de reserva, Panel de Mis Reservas y Admin Dashboard. | **Completado** |
| **Semana 4** | QA, Hardening y Despliegue | Suite de pruebas unitarias (Vitest), Informe de QA, Documentación en `docs/` y Despliegue en Render. | **En Progreso** |

---

## 3. Matriz de Riesgos y Mitigación

| Riesgo Identificado | Severidad | Probabilidad | Estrategia de Mitigación |
|---|:---:|:---:|---|
| Reservas superpuestas por peticiones concurrentes | Alta | Media | Restricción de exclusión en PostgreSQL con `btree_gist` + transacción atómica en backend. |
| Caída del servidor o tiempo de respuesta elevado | Media | Baja | Consultas parametrizadas e indexadas sobre fechas de reservas y compresión gzip en frontend. |
| Pérdida de credenciales o filtración de datos sensibles | Alta | Baja | Variables de entorno aisladas (`.env`), contraseñas hasheadas con bcrypt y tokens JWT con expiración. |
| Incompatibilidad de dependencias entre paquetes | Media | Media | Fijación de versiones en `package.json` y control estricto de `package-lock.json`. |
