# 📚 Centro de Documentación - Alborada Hotel Boutique

Bienvenido a la documentación oficial y técnica del **Sistema de Reservas y Gestión Hotelera de Alborada Hotel Boutique**. Este espacio recopila los requisitos, especificaciones técnicas, flujos de usuario, hoja de ruta y reportes de calidad del proyecto.

---

## 🗺️ Mapa de Documentación

| Documento | Descripción | Audiencia principal |
|---|---|---|
| [**PRD.md**](./PRD.md) | **Documento de Requisitos de Producto**: Planteamiento del problema, propuesta de valor, objetivos, KPIs, roles (RBAC), historias de usuario y matriz de requisitos funcionales y no funcionales. | Product Owners, Desarrolladores, Diseñadores |
| [**TRD.md**](./TRD.md) | **Documento de Requisitos Técnicos**: Arquitectura de 3 capas, modelo de datos (DER en PostgreSQL), diseño de la API REST, garantía de no superposición y seguridad. | Desarrolladores Backend/Frontend, DevOps |
| [**USER_FLOW.md**](./USER_FLOW.md) | **Flujos de Usuario y Experiencia**: Rutas críticas del cliente y administrador, máquina de estados de reservas y manejo de excepciones. | Diseñadores UX/UI, QA, Desarrolladores Frontend |
| [**PLAN.md**](./PLAN.md) | **Hoja de Ruta y Cronograma**: Plan de 4 semanas, entregables por hitos, matriz de riesgos y mitigaciones. | Líderes de Proyecto, Evaluadores |
| [**QA_TEST_REPORT.md**](./QA_TEST_REPORT.md) | **Informe de Aseguramiento de Calidad (QA)**: Resultados de la suite automatizada (Vitest), reglas de negocio validadas y pruebas de interfaz en navegador. | QA Engineers, Desarrolladores |

---

## 🏗️ Resumen del Sistema

### Arquitectura General
El sistema implementa una arquitectura desacoplada y orientada a servicios:

```
┌────────────────────────────────┐
│   FRONTEND (React + Vite)      │
│   Tailwind CSS / Motion UI     │
└───────────────┬────────────────┘
                │  HTTPS / JSON (REST API)
                ▼
┌────────────────────────────────┐
│   BACKEND (Node.js + Express)  │
│   Auth JWT, Zod, bcrypt        │
└───────────────┬────────────────┘
                │  SQL Parametrizado / btree_gist
                ▼
┌────────────────────────────────┐
│   BASE DE DATOS (PostgreSQL)   │
│   Integridad Referencial       │
└────────────────────────────────┘
```

### Reglas de Negocio Esenciales
- **RN01 (No Superposición)**: No se permite reservar una habitación en fechas solapadas con otra reserva `CONFIRMADA` o `PENDIENTE`. El intervalo tratado es $[fecha\_entrada, fecha\_salida)$ permitiendo salida y entrada el mismo día.
- **RN02 (Cálculo de Importe)**: El total se calcula en el servidor multiplicando la tarifa de la habitación por la cantidad de noches.
- **RN03 (Cancelación)**: El cliente puede cancelar su reserva sin penalización hasta 48 horas antes del check-in.
- **RN04 (Capacidad)**: Solo se ofrecen habitaciones cuya capacidad máxima sea igual o superior a los huéspedes solicitados.
- **RN07 (Mantenimiento)**: Habitaciones inactivas o en mantenimiento son excluidas automáticamente del catálogo y disponibilidad.

---

## 🚀 Inicio Rápido de Desarrollo

### Requisitos Previos
- **Node.js** v20+ o v26+ (LTS recomendado).
- **npm** v10+.

### Comandos Principales
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (Vite en puerto 3000)
npm run dev

# 3. Ejecutar suite de pruebas de calidad (Vitest)
npm test

# 4. Compilar para producción
npm run build

# 5. Verificación estricta de TypeScript
npm run lint
```

