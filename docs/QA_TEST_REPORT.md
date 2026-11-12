# QA TEST REPORT - Informe de Aseguramiento de Calidad

**Hotel:** Alborada Hotel Boutique  
**Responsable:** Alvaro Andrés  
**Versión del informe:** 2.0 (Noviembre de 2026)  
**Entorno de ejecución:** `node v26.13.1`, `vitest v5.1.0`  
**Ramas auditadas:** `dev`, `qa`, `main`

---

## 1. Resumen Ejecutivo de Pruebas

El sistema de reservas hoteleras cuenta con una suite completa de pruebas unitarias y de integración que validan el 100% de las reglas de negocio descritas en la arquitectura:

- **Total de pruebas ejecutadas:** 23 tests
- **Pruebas superadas (PASS):** 23 (100%)
- **Pruebas fallidas (FAIL):** 0 (0%)
- **Suites de prueba:** 3 archivos (`hotelBusinessLogic.test.ts`, `featuresPhase2.test.ts`, `featuresPhase3.test.ts`)

```bash
> npm test

 ✓ src/__tests__/featuresPhase3.test.ts (6 tests) 11ms
 ✓ src/__tests__/hotelBusinessLogic.test.ts (12 tests) 135ms
 ✓ src/__tests__/featuresPhase2.test.ts (5 tests) 47ms

 Test Files  3 passed (3)
      Tests  23 passed (23)
   Duration  938ms
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

### 2.3 Regla RN01 - Detección de Superposición de Reservas [E, S)
| ID | Caso de Prueba | Condición evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-RN01-01` | Solapamiento total o parcial en reserva activa | Fechas coinciden con reserva `CONFIRMADA` | Conflicto detectado (`true`) | **PASS** |
| `TC-RN01-02` | Check-in en la misma fecha de check-out anterior | Intervalos [E1, S1) y [S1, S2) disjuntos | Permitido (`false`) | **PASS** |
| `TC-RN01-03` | Exclusión de reservas canceladas | Reserva existente con estado `CANCELADA` | No genera conflicto (`false`) | **PASS** |
| `TC-RN01-04` | Consulta sobre habitación distinta | Mismo rango de fechas en habitación diferente | No genera conflicto (`false`) | **PASS** |

### 2.4 Reglas RN04 y RN07 - Capacidad y Mantenimiento
| ID | Caso de Prueba | Regla evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-RN07-01` | Filtrado de inventario no disponible | Habitación con `estado: 'MANTENIMIENTO'` o `activa: false` | Excluida de la disponibilidad | **PASS** |
| `TC-RN04-01` | Validación de capacidad por tipo | Huéspedes solicitados vs capacidad del tipo | Solo tipos con capacidad suficiente | **PASS** |

### 2.5 Fase 2 - Comprobantes, Correos, Código y Galería
| ID | Caso de Prueba | Característica evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-P2-01` | Generación de Código Único de Reserva | Formato estándar `ALB-AAAAMMDD-XXXX` | Único y reproducible | **PASS** |
| `TC-P2-02` | Emisión de Comprobante en PDF | Exportación de documento imprimible oficial | Descarga con tipografía y datos completos | **PASS** |
| `TC-P2-03` | Modal de Correo de Confirmación | Vista previa fiel del correo para el huésped | Datos de reserva, código e instrucciones | **PASS** |
| `TC-P2-04` | Galería Fotográfica de Habitaciones | Selector de fotos e indicador de posición | Transiciones y miniaturas fluidas | **PASS** |

### 2.6 Fase 3 - Cupones, Calificaciones, Gráficas y Calendario
| ID | Caso de Prueba | Característica evaluada | Comportamiento | Resultado |
|---|---|---|---|:---:|
| `TC-P3-01` | Validación de cupón porcentual (`ALBORADA10`) | Descuento del 10% sobre subtotal liquidado | Deducción exacta | **PASS** |
| `TC-P3-02` | Restricción de noches mínimas (`BIENVENIDA20`) | Mínimo 2 noches requeridas para aplicar 20% | Valida y rechaza si es menor a 2 noches | **PASS** |
| `TC-P3-03` | Cupón de monto fijo (`ESCAPADA50K`) | Descuento de $50.000 COP directo | Aplica monto fijo sin exceder subtotal | **PASS** |
| `TC-P3-04` | Calificación de estancias finalizadas | Asignación de 1 a 5 estrellas con reseña | Almacenamiento y recalculo de promedio | **PASS** |
| `TC-P3-05` | Gráficas de ocupación diaria | Curva y barras de porcentaje diario de 14 días | Visualización en tiempo real | **PASS** |
| `TC-P3-06` | Calendario visual de reservas (Gantt) | Vista cronológica mensual por habitación y días | Bloques de reserva interactivos | **PASS** |

---

## 3. Auditoría de Flujos en Interfaz de Usuario (http://localhost:3000)

| Módulo | Componentes Auditados | Estado |
|---|---|:---:|
| **Landing & Hero** | `HeroSection.tsx`, Barra de búsqueda rápida de fechas y huéspedes | **PASS** |
| **Catálogo** | `CatalogSection.tsx`, Tarjetas de 30 habitaciones, fotos, badges de estrellas y tarifas | **PASS** |
| **Disponibilidad** | `DisponibilidadView.tsx`, Filtros dinámicos con exclusión de solapamientos | **PASS** |
| **Reserva** | `BookingModal.tsx`, Cálculo en vivo, integración de cupones de descuento | **PASS** |
| **Confirmación** | `BookingConfirmationModal.tsx`, Generación de código único `ALB-XXXXX` | **PASS** |
| **Mis Reservas** | `MyReservationsView.tsx`, Comprobante PDF, ver correo, calificar estancia | **PASS** |
| **Calendario Visual** | `AdminCalendarView.tsx`, Matriz de ocupación mensual estilo Gantt | **PASS** |
| **Reportes & Gráficas** | `AdminReportsView.tsx`, Curva de ocupación diaria, desglose por piso y cupones | **PASS** |
| **Admin Dashboard** | `AdminDashboard.tsx`, KPIs de ocupación en tiempo real y accesos rápidos | **PASS** |
