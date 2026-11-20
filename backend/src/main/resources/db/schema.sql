-- =============================================================================
-- ESQUEMA DE BASE DE DATOS RELACIONAL POSTGRESQL - HOTEL ALBORADA BOUTIQUE
-- Versión: 2.0.0 (Sprint 2)
-- Motor: PostgreSQL 14+ / Spring Boot Data JPA
-- =============================================================================

-- Habilitar extensión para UUIDs si es requerida en el futuro
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: usuarios (Credenciales, control de acceso y roles RBAC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'CLIENTE' CHECK (rol IN ('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE')),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- -----------------------------------------------------------------------------
-- 2. TABLA: tipos_habitacion (Catálogo maestro de categorías de suites)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipos_habitacion (
    id_tipo BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    precio_base NUMERIC(12, 2) NOT NULL CHECK (precio_base > 0)
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: habitaciones (Inventario físico de habitaciones del hotel)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitaciones (
    id_habitacion BIGSERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    piso INT NOT NULL CHECK (piso > 0),
    id_tipo BIGINT REFERENCES tipos_habitacion(id_tipo) ON DELETE RESTRICT,
    tipo VARCHAR(50) NOT NULL,
    precio_base NUMERIC(12, 2) NOT NULL CHECK (precio_base > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'RESERVADA', 'OCUPADA', 'MANTENIMIENTO')),
    descripcion TEXT,
    imagen VARCHAR(500),
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_habitaciones_numero ON habitaciones(numero);
CREATE INDEX IF NOT EXISTS idx_habitaciones_estado ON habitaciones(estado);
CREATE INDEX IF NOT EXISTS idx_habitaciones_piso ON habitaciones(piso);
CREATE INDEX IF NOT EXISTS idx_habitaciones_activa ON habitaciones(activa);

-- -----------------------------------------------------------------------------
-- 4. TABLA: clientes (Ficha de huéspedes y clientes registrados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'CC' CHECK (tipo_documento IN ('CC', 'CE', 'PAS', 'NIT', 'TI')),
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    direccion VARCHAR(200),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_documento ON clientes(documento);
CREATE INDEX IF NOT EXISTS idx_clientes_correo ON clientes(correo);

-- -----------------------------------------------------------------------------
-- 5. TABLA: cupones (Campañas de fidelización y descuentos comerciales)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cupones (
    id_cupon BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    porcentaje_descuento NUMERIC(5, 2) DEFAULT 0 CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    descuento_fijo NUMERIC(12, 2) DEFAULT 0 CHECK (descuento_fijo >= 0),
    noches_minimas INT DEFAULT 1 CHECK (noches_minimas >= 1),
    monto_minimo NUMERIC(12, 2) DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_expiracion DATE
);

CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);

-- -----------------------------------------------------------------------------
-- 6. TABLA: reservas (Expediente contractual de estancia y liquidación)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    id_cliente BIGINT NOT NULL REFERENCES clientes(id_cliente) ON DELETE RESTRICT,
    id_habitacion BIGINT NOT NULL REFERENCES habitaciones(id_habitacion) ON DELETE RESTRICT,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    cantidad_huespedes INT NOT NULL CHECK (cantidad_huespedes > 0),
    precio_noche NUMERIC(12, 2) NOT NULL CHECK (precio_noche > 0),
    cantidad_noches INT NOT NULL CHECK (cantidad_noches > 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    descuento NUMERIC(12, 2) DEFAULT 0 CHECK (descuento >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    cupon_aplicado VARCHAR(30),
    saldo NUMERIC(12, 2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADA' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'CHECK_IN', 'FINALIZADA', 'CANCELADA')),
    numero_llave VARCHAR(20),
    fecha_checkin TIMESTAMP WITH TIME ZONE,
    fecha_checkout TIMESTAMP WITH TIME ZONE,
    motivo_cancelacion TEXT,
    notas TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_coherentes CHECK (fecha_salida > fecha_entrada)
);

CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo);
CREATE INDEX IF NOT EXISTS idx_reservas_cliente ON reservas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_reservas_habitacion ON reservas(id_habitacion);
CREATE INDEX IF NOT EXISTS idx_reservas_fechas ON reservas(fecha_entrada, fecha_salida);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);

-- -----------------------------------------------------------------------------
-- 7. TABLA: pagos (Comprobantes transaccionales y abonos en counter)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id_pago BIGSERIAL PRIMARY KEY,
    id_reserva BIGINT NOT NULL REFERENCES reservas(id_reserva) ON DELETE CASCADE,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
    recibo_caja VARCHAR(40) NOT NULL UNIQUE,
    registrado_por VARCHAR(120),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_reserva ON pagos(id_reserva);
CREATE INDEX IF NOT EXISTS idx_pagos_recibo ON pagos(recibo_caja);
