# 🏨 Alborada Hotel Boutique - Sistema de Reservas

Sistema integral de reservas y gestión hotelera desarrollado para **Alborada Hotel Boutique**. Proporciona a los clientes una plataforma en línea intuitiva para consultar disponibilidad y reservar habitaciones en tiempo real, e incorpora un panel administrativo completo para el control de inventario, ocupación y estados de reserva.

---

## ✨ Características Principales

- **Catálogo de Habitaciones**: Visualización de 30 habitaciones distribuidas en 3 pisos, con fotos de alta resolución, capacidades, servicios incluidos y tarifas en pesos colombianos (COP).
- **Motor de Disponibilidad en Tiempo Real (RN01)**: Algoritmo de no superposición $[fecha\_entrada, fecha\_salida)$ que impide el overbooking y permite check-in el mismo día del check-out de otra reserva.
- **Flujo de Reserva Intuitivo**: Cálculo instantáneo del número de noches y total a pagar en el servidor, formulario modal y generación de código oficial único (`ALB-XXXXX`).
- **Portal del Huésped ("Mis Reservas")**: Historial de reservas con seguimiento de estados y política de cancelación anticipada (hasta 48 horas antes del check-in).
- **Panel Administrativo Completo**: Métricas clave (tasa de ocupación, inventario disponible/en mantenimiento, ingresos estimados), matriz de distribución por pisos y control de estados de reservas.
- **Suite de Pruebas Automatizadas**: 12 pruebas unitarias y de reglas de negocio integradas con Vitest.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite.
- **Estilos & Animaciones**: Tailwind CSS v4, Lucide Icons, Motion UI.
- **Backend (API REST)**: Node.js, Express, Zod, JWT, bcrypt.
- **Base de Datos**: PostgreSQL (Restricciones temporales con `btree_gist`).
- **Aseguramiento de Calidad**: Vitest.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) v20 o superior (LTS recomendado).
- [npm](https://www.npmjs.com/) v10+.

### 1. Clonar el repositorio y acceder
```bash
git clone https://github.com/Alvaro-Papamija/Reservas-Hoteleras.git
cd Reservas-Hoteleras
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación quedará disponible en: **[http://localhost:3000](http://localhost:3000)**.

### 4. Ejecutar pruebas automatizadas
```bash
npm test
```

---

## 📖 Documentación Completa

Toda la documentación técnica, funcional y de arquitectura se encuentra centralizada en la carpeta **[`docs/`](./docs/README.md)**:

| Documento | Enlace | Contenido |
|---|---|---|
| **Centro de Documentación** | [docs/README.md](./docs/README.md) | Guía de navegación general y resumen arquitectónico. |
| **PRD (Requisitos de Producto)** | [docs/PRD.md](./docs/PRD.md) | Problema, objetivos, KPIs, matriz RBAC, historias de usuario y reglas de negocio. |
| **TRD (Requisitos Técnicos)** | [docs/TRD.md](./docs/TRD.md) | Arquitectura de 3 capas, esquema relacional (DER), tablas, endpoints REST y seguridad. |
| **Flujos de Usuario** | [docs/USER_FLOW.md](./docs/USER_FLOW.md) | Diagramas de secuencia, caminos críticos y máquina de estados de reservas. |
| **Hoja de Ruta (Roadmap)** | [docs/PLAN.md](./docs/PLAN.md) | Cronograma de 4 semanas, entregables por hitos y matriz de riesgos. |
| **Informe de Calidad (QA)** | [docs/QA_TEST_REPORT.md](./docs/QA_TEST_REPORT.md) | Reporte de casos de prueba ejecutados y aprobados con Vitest. |

---

## 👤 Autor
- **Desarrollador y Responsable:** Alvaro Andrés Papamija
- **Institución:** SENA - 2026
