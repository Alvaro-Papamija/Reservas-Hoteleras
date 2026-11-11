# PLAN - Hoja de ruta del Sistema de Reservas Hoteleras

**Responsable:** Alvaro Andrés
**Duración:** 4 semanas
**Versión del documento:** 1.0 (noviembre de 2026)
**Documentos relacionados:** PRD.md, TRD.md

---

## 1. Priorización: MVP e iteraciones futuras

### Fase 1 - MVP (4 semanas)

Núcleo mínimo para que el producto sea funcional:

- Registro, inicio de sesión y control de roles (ADMINISTRADOR y CLIENTE).
- CRUD de habitaciones y tipos de habitación.
- Consulta de clientes por el administrador.
- Catálogo con búsqueda y filtros.
- Consulta de disponibilidad por fechas y huéspedes.
- Creación de reservas con cálculo de total en el backend y bloqueo de superposiciones.
- Consulta y cancelación de reservas por el cliente.
- Gestión de reservas y estados por el administrador.
- Dashboard y reportes básicos.
- Interfaz responsive, pruebas, documentación y despliegue en Internet.

### Fase 2 - Nice-to-have (nivel 1 y 2)

- Correo de confirmación de reserva.
- Código de reserva visible y comprobante en PDF.
- Galería de imágenes por habitación.
- Calendario visual de reservas.
- Gráficas de ocupación.
- Recuperación de contraseña.

### Fase 3 - Futuro (nivel 3 y extensiones)

- Sistema de calificaciones y cupones o descuentos.
- Recomendación de habitaciones con IA y chatbot de preguntas frecuentes.
- Predicción básica de ocupación y notificaciones automáticas.
- Pasarela de pagos, integración con canales externos, multi-hotel y aplicación móvil.

## 2. Hitos secuenciales

Enfoque elegido: **por capas durante las semanas 1 a 3 y cierre integrado en la semana 4**, siguiendo el cronograma del proyecto. Dentro de cada semana, el trabajo se organiza en funcionalidades completas para poder validarlas de principio a fin.

| Semana | Hito | Resultado esperado |
|---|---|---|
| 1 | Análisis, requisitos, UML, base de datos y prototipo | Diseño completo |
| 2 | Backend, PostgreSQL, autenticación y CRUD | API funcional |
| 3 | React, interfaces e integración | Sistema funcional |
| 4 | Pruebas, seguridad, documentación y despliegue | MVP terminado |

### Semana 1 - Diseño

Entregables: problema, objetivos, alcance, SRS, historias de usuario, Product Backlog, DER, diagramas UML (casos de uso y clases), diccionario de datos y prototipo en Figma.

### Semana 2 - API

Entregables: repositorio en GitHub, base de datos PostgreSQL con migraciones y datos semilla, autenticación (registro, login, JWT, roles), CRUD de usuarios, habitaciones, tipos, clientes y reservas, validación de superposición, y colección inicial de Postman.

### Semana 3 - Interfaz e integración

Entregables: proyecto React, login y registro, catálogo con filtros, consulta de disponibilidad, flujo de reserva, "Mis reservas", panel administrativo (habitaciones, tipos, clientes, reservas, dashboard) e integración con la API.

### Semana 4 - Cierre

Entregables: pruebas funcionales y de integración, corrección de errores, revisión de seguridad, reportes, README, manuales (usuario y técnico), despliegue público, usuarios de prueba y preparación de la sustentación.

## 3. Puertas de calidad (validation gates)

Un hito no se da por terminado hasta cumplir todos los puntos de su puerta.

| Puerta | Condición para avanzar |
|---|---|
| Fin de semana 1 | Backlog priorizado; DER y diccionario de datos revisados; prototipo cubre el flujo cliente y administrador; esquema SQL ejecutable sin errores. |
| Fin de semana 2 | Todos los endpoints responden según lo documentado en Postman; autenticación y roles funcionan; la restricción de no superposición rechaza casos de prueba; pruebas de integración de reservas pasan; lint sin errores. |
| Fin de semana 3 | El flujo completo cliente (registro, búsqueda, reserva, consulta, cancelación) y administrador funciona en el navegador y en el celular; sin errores en consola; construcción del frontend limpia. |
| Fin de semana 4 | 90 % o más de los casos de prueba documentados aprobados; sin errores críticos abiertos; despliegue accesible por URL; documentación completa. |

### Sensores y mecanismos de retroalimentación

- Pruebas unitarias y de integración (Jest + Supertest).
- Colección de Postman ejecutada completa.
- Linter (ESLint) y formato (Prettier).
- Compilación limpia del frontend y GitHub Actions en cada Pull Request.
- Revisión manual en navegador de escritorio y en celular.

### Intervención humana (human-in-the-loop)

Alvaro revisa y aprueba manualmente: el esquema de base de datos antes de crear migraciones, las reglas de reservas y de cálculo de precio, cada Pull Request antes de unirlo a `main`, el despliegue a producción y todo código generado por IA, que debe poder explicar en la sustentación.

## 4. Tamaño de las tareas

Se usan **micro-tareas atómicas**, cada una con un objetivo único, archivos afectados claramente delimitados y criterio de aceptación verificable. Tamaño objetivo: entre 1 y 3 horas, con un máximo de media jornada.

Ejemplos:

- "Crear la migración de la tabla HABITACION con sus restricciones."
- "Crear el endpoint de login con validación y emisión de JWT."
- "Implementar la consulta de disponibilidad por rango de fechas."
- "Crear el componente de filtros del catálogo."

Cada tarea se trabaja en una rama propia (`feat/...`, `fix/...`) y se une a `main` mediante Pull Request. Para tareas que requieran apoyo de IA, el prompt incluye: objetivo, archivos permitidos, archivos prohibidos, criterios de aceptación y pruebas esperadas.

### Backlog inicial por semana

**Semana 1**
- T1.1 Redactar problema, objetivos y alcance.
- T1.2 Elaborar SRS (RF01 a RF20, RNF01 a RNF10, reglas de negocio).
- T1.3 Historias de usuario y Product Backlog.
- T1.4 Diseñar DER y diccionario de datos.
- T1.5 Diagramas de casos de uso y de clases.
- T1.6 Prototipo en Figma (cliente y administrador).

**Semana 2**
- T2.1 Crear repositorio, estructura de carpetas y `.gitignore`.
- T2.2 Configurar proyecto Express y conexión a PostgreSQL.
- T2.3 Migraciones y datos semilla.
- T2.4 Registro y login con bcrypt y JWT.
- T2.5 Middleware de autenticación y roles.
- T2.6 CRUD de tipos y habitaciones.
- T2.7 Endpoints de clientes.
- T2.8 Endpoint de disponibilidad.
- T2.9 Creación de reservas con cálculo de total.
- T2.10 Restricción de no superposición y pruebas.
- T2.11 Cambio de estado y cancelación de reservas.
- T2.12 Colección de Postman.

**Semana 3**
- T3.1 Configurar React, rutas y capa de acceso a la API.
- T3.2 Login, registro y manejo de sesión.
- T3.3 Página de inicio con buscador de disponibilidad.
- T3.4 Catálogo, filtros y detalle de habitación.
- T3.5 Flujo de reserva y pantalla de confirmación.
- T3.6 "Mis reservas" y cancelación.
- T3.7 Panel administrativo: habitaciones y tipos.
- T3.8 Panel administrativo: clientes y reservas.
- T3.9 Dashboard.
- T3.10 Ajustes responsive.

**Semana 4**
- T4.1 Pruebas funcionales y registro de resultados.
- T4.2 Corrección de errores encontrados.
- T4.3 Revisión de seguridad (rutas, roles, secretos, validaciones).
- T4.4 Reportes de reservas, ocupación e ingresos.
- T4.5 README y documentación de la API.
- T4.6 Manual de usuario y manual técnico.
- T4.7 Despliegue en producción y usuarios de prueba.
- T4.8 Bitácora de uso de IA y preparación de la sustentación.

## 5. Estrategia de despliegue y retroalimentación externa

### Entornos

| Entorno | Propósito | Alojamiento |
|---|---|---|
| Local | Desarrollo y pruebas | Máquina de Alvaro (Node.js y PostgreSQL) |
| Pruebas en vivo (staging) | Revisión con compañeros, instructor y posibles usuarios | Render, desplegado desde la rama de desarrollo |
| Producción | Versión final de entrega | Render, desplegado desde `main` |

### Calendario de despliegues de prueba

- **Fin de semana 2:** API desplegada y probada con Postman contra la URL pública.
- **Fin de semana 3:** frontend y backend integrados en staging; se comparte el enlace con 2 o 3 personas para probar el flujo de reserva.
- **Semana 4:** ajustes según retroalimentación, despliegue final y verificación con usuario administrador y usuario cliente de prueba.

### Preparación desde el inicio

- Secretos configurados como variables del proveedor, nunca en el repositorio.
- Base de datos con persistencia real y copias de seguridad del plan.
- Datos de prueba cargados mediante script de semilla.

### Entrega final

URL del sistema, usuario administrador de prueba, usuario cliente de prueba, repositorio de GitHub y documentación (SRS, diseño, pruebas, manual de usuario y manual técnico).

## 6. Riesgos y mitigación

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| El tiempo no alcanza para todo el alcance | Media | Mantener estrictamente el MVP; dejar nice-to-have para la fase 2. |
| Errores en la lógica de fechas y superposición | Alta | Probar con casos límite desde la semana 2; restricción en la base de datos. |
| Código generado por IA que no se comprende | Media | Revisar cada bloque, comentarlo y registrarlo en la bitácora. |
| Límites del plan gratuito del hosting | Media | Desplegar pronto (semana 2) y tener Railway o VPS como alternativa. |
| Cambios de esquema tardíos | Media | Cerrar el DER en la semana 1; cambios solo mediante migraciones. |
