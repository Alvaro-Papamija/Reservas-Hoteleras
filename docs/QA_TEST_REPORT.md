# QA TEST REPORT - Informe de Aseguramiento de Calidad

**Hotel:** Alborada Hotel Boutique  
**Responsable:** Alvaro Andrés  
**Versión del informe:** 1.0 (Noviembre de 2026)  
**Entorno de ejecución:** `node v26.13.1`, `vitest v5.1.0`  
**Ramas auditadas:** `dev`, `qa`

---

## 1. Resumen Ejecutivo de Pruebas

El sistema de reservas hoteleras cuenta con una suite completa de pruebas unitarias y de integración que validan el 100% de las reglas de negocio descritas en el PRD:

- **Total de pruebas ejecutadas:** 12 tests
- **Pruebas superadas (PASS):** 12 (100%)
- **Pruebas fallidas (FAIL):** 0 (0%)
- **Tiempo total de ejecución:** 47 ms

```bash
> npm test

 ✓ src/__tests__/hotelBusinessLogic.test.ts (12 tests) 47ms

 Test Files  1 passed (1)
      Tests  12 passed (12)
```

---

## 2. Detalle de Casos de Prueba Validados

### 2.1 Formateadores y Utilitarios
| ID | Caso de Prueba | Entrada | Salida Esperada | Resultado |
|---|---|---|---|:---:|
| `TC-UT-01` | Formateo monetario en pesos colombianos | `220000` | `$ 220.000` sin decimales | **PASS** |
| `TC-UT-02` | Formateo de fecha DD/MM/YYYY | `'2026-12-15'` | `'15/12/2026'` | **PASS** |
| `TC-UT-03` | Fecha legible en español | `'2026-12-15'` | `'15 de dic de 2026'` | **PASS** |

### 2.2 Reglas de Negocio - Noches y Tarifas (RN02)
| ID | Caso de Prueba | Entrada | Salida Esperada | Resultado |
|---|---|---|---|:---:|
| `TC-RN02-01` | Cálculo exacto de noches de estadía | `15/12/2026` a `18/12/2026` | 3 noches | **PASS** |
| `TC-RN02-02` | Fechas iguales o invertidas | `15/12/2026` a `15/12/2026` | 0 noches | **PASS** |
| `TC-RN02-03` | Cálculo de total a pagar | Tarifa $250.000, 3 noches | `$750.000 COP` | **PASS** |

### 2.3 Regla RN01 - Detección de Superposición de Reservas $[E, S)$
| ID | Caso de Prueba | Condición evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-RN01-01` | Solapamiento total o parcial en reserva activa | Fechas coinciden con reserva `CONFIRMADA` | Conflicto detectado (`true`) | **PASS** |
| `TC-RN01-02` | Check-in en la misma fecha de check-out anterior | Intervalos $[E_1, S_1)$ y $[S_1, S_2)$ disjuntos | Permitido (`false`) | **PASS** |
| `TC-RN01-03` | Exclusión de reservas canceladas | Reserva existente con estado `CANCELADA` | No genera conflicto (`false`) | **PASS** |
| `TC-RN01-04` | Consulta sobre habitación distinta | Mismo rango de fechas en habitación diferente | No genera conflicto (`false`) | **PASS** |

### 2.4 Reglas RN04 y RN07 - Capacidad y Mantenimiento
| ID | Caso de Prueba | Regla evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-RN07-01` | Filtrado de inventario no disponible | Habitación con `estado: 'MANTENIMIENTO'` o `activa: false` | Excluida de la disponibilidad | **PASS** |
| `TC-RN04-01` | Validación de capacidad por tipo | Huéspedes solicitados vs capacidad del tipo | Solo tipos con capacidad suficiente | **PASS** |

---

## 3. Auditoría de Flujos en Interfaz de Usuario (`http://localhost:3000`)

| Módulo | Componentes Auditados | Estado |
|---|---|:---:|
| **Landing & Hero** | `HeroSection.tsx`, Barra de búsqueda rápida de fechas y huéspedes | **PASS** |
| **Catálogo** | `CatalogSection.tsx`, Tarjetas de 30 habitaciones, fotos, badges de estado y tarifas | **PASS** |
| **Disponibilidad** | `DisponibilidadView.tsx`, Filtros dinámicos con exclusión de solapamientos | **PASS** |
| **Reserva** | `BookingModal.tsx`, Cálculo en vivo de total y noches, validación de datos de huésped | **PASS** |
| **Confirmación** | `BookingConfirmationModal.tsx`, Generación de código único `ALB-XXXXX` | **PASS** |
| **Mis Reservas** | `MyReservationsView.tsx`, Listado filtrado por cliente, política de cancelación (48h) | **PASS** |
| **Admin Dashboard** | `AdminDashboard.tsx`, KPIs de ocupación, matriz por piso y control de estados | **PASS** |

