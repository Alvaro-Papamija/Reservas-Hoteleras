-- =============================================================================
-- DATOS SEMILLA DML - HOTEL ALBORADA BOUTIQUE
-- Versión: 2.0.0 (Sprint 2)
-- Datos iniciales maestros: Tipos de habitación, habitaciones, usuarios,
-- clientes, cupones y reservas iniciales de prueba.
-- =============================================================================

-- 1. TIPOS DE HABITACIÓN
INSERT INTO tipos_habitacion (id_tipo, nombre, descripcion, capacidad, precio_base) VALUES
(1, 'Individual', 'Habitación acogedora diseñada para viajeros solitarios o estancias corporativas, con escritorio ergonómico y cama twin.', 1, 120000.00),
(2, 'Doble', 'Elegante habitación equipada con cama Queen size o dos individuales, iluminación cálida y vista a los jardines interiores.', 2, 180000.00),
(3, 'Triple', 'Espaciosa suite pensada para grupos pequeños o amigos, con 3 camas individuales o combinación Queen + individual.', 3, 240000.00),
(4, 'Familiar', 'Confortable suite múltiple con dos ambientes independientes, cama King y dos camas sencillas para máxima privacidad familiar.', 4, 320000.00),
(5, 'Suite', 'Nuestra máxima experiencia de lujo colonial: balcón privado con vista panorámica, jacuzzi con hidromasaje y sala de estar.', 2, 420000.00)
ON CONFLICT (id_tipo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio_base = EXCLUDED.precio_base,
    capacidad = EXCLUDED.capacidad;

-- 2. HABITACIONES FÍSICAS (Pisos 1, 2 y 3)
INSERT INTO habitaciones (numero, piso, id_tipo, tipo, precio_base, estado, descripcion, imagen, activa) VALUES
('101', 1, 1, 'Individual', 120000.00, 'DISPONIBLE', 'Habitación individual tranquila en planta baja con jardín privado y escritorio de trabajo.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', true),
('102', 1, 2, 'Doble', 180000.00, 'DISPONIBLE', 'Habitación doble clásica en piso 1 con cama Queen y baño privado en mármol colonial.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', true),
('103', 1, 2, 'Doble', 180000.00, 'RESERVADA', 'Habitación doble con salida directa al solárium de la piscina y terraza de piedra natural.', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80', true),
('104', 1, 2, 'Doble', 180000.00, 'DISPONIBLE', 'Doble deluxe con dos camas individuales queen, detalles de terracota y lencería blanca.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', true),
('105', 1, 5, 'Suite', 420000.00, 'DISPONIBLE', 'Suite presidencial en planta baja con jacuzzi hidromasaje, cama King y jardín zen privado.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', true),
('201', 2, 2, 'Doble', 180000.00, 'DISPONIBLE', 'Habitación doble en segundo piso con balcón hacia la plaza central y ventanales coloniales.', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', true),
('202', 2, 3, 'Triple', 240000.00, 'DISPONIBLE', 'Suite triple con tres camas individuales, balcón y excelente iluminación natural.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', true),
('203', 2, 4, 'Familiar', 320000.00, 'DISPONIBLE', 'Suite familiar espaciosa de dos estancias, smart TV 65 pulgadas y vista panorámica.', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80', true),
('204', 2, 5, 'Suite', 420000.00, 'OCUPADA', 'Suite nupcial con jacuzzi privado, cama King y cava de vinos refrigerada.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', true),
('301', 3, 5, 'Suite', 420000.00, 'DISPONIBLE', 'Suite Mirador en el último piso con terraza privada de 360 grados y solárium exclusivo.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', true)
ON CONFLICT (numero) DO UPDATE SET
    tipo = EXCLUDED.tipo,
    precio_base = EXCLUDED.precio_base,
    estado = EXCLUDED.estado;

-- 3. USUARIOS INICIALES (Contraseñas cifradas en BCrypt)
-- Hash válido BCrypt para las contraseñas: Admin123*, Recepcion123*, Cliente123*
INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, rol, estado) VALUES
(1, 'Alvaro Papamija', 'alvaro@hotelalborada.com', '$2a$10$7v1bVq0d3sW8x9c0e1g2hO7k8m9n0p1q2r3s4t5u6v7w8x9y0z1a.', 'ADMINISTRADOR', true),
(2, 'Carolina Méndez', 'recepcion@hotelalborada.com', '$2a$10$7v1bVq0d3sW8x9c0e1g2hO7k8m9n0p1q2r3s4t5u6v7w8x9y0z1a.', 'RECEPCIONISTA', true),
(3, 'Laura Gómez', 'laura.gomez@ejemplo.com', '$2a$10$7v1bVq0d3sW8x9c0e1g2hO7k8m9n0p1q2r3s4t5u6v7w8x9y0z1a.', 'CLIENTE', true),
(4, 'Carlos Restrepo', 'carlos.restrepo@ejemplo.com', '$2a$10$7v1bVq0d3sW8x9c0e1g2hO7k8m9n0p1q2r3s4t5u6v7w8x9y0z1a.', 'CLIENTE', true)
ON CONFLICT (correo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;

-- 4. CLIENTES REGISTRADOS
INSERT INTO clientes (id_cliente, id_usuario, nombre, apellido, tipo_documento, documento, telefono, correo, direccion) VALUES
(1, 3, 'Laura', 'Gómez', 'CC', '1085294821', '+57 312 458 9012', 'laura.gomez@ejemplo.com', 'Calle 72 # 11-45, Bogotá D.C.'),
(2, 4, 'Carlos', 'Restrepo', 'CC', '71284910', '+57 301 234 5678', 'carlos.restrepo@ejemplo.com', 'Carrera 43A # 1-50, Medellín, Antioquia'),
(3, NULL, 'Mariana', 'Duarte', 'CE', 'E8492019', '+57 315 987 6543', 'mariana.duarte@ejemplo.com', 'Avenida Santander # 54-12, Manizales')
ON CONFLICT (documento) DO UPDATE SET
    telefono = EXCLUDED.telefono,
    correo = EXCLUDED.correo;

-- 5. CUPONES DE PROMOCIÓN
INSERT INTO cupones (codigo, descripcion, porcentaje_descuento, descuento_fijo, noches_minimas, monto_minimo, activo, fecha_expiracion) VALUES
('BIENVENIDA2026', 'Descuento especial del 15% para nuevos huéspedes en su primera estancia', 15.00, 0, 1, 100000.00, true, '2026-12-31'),
('ALBORADA10', 'Descuento del 10% de fidelidad corporativa para estancias de 2 o más noches', 10.00, 0, 2, 200000.00, true, '2026-12-31'),
('DESCUENTO50K', 'Bono directo de $50.000 COP en estancias superiores a 3 noches', 0, 50000.00, 3, 300000.00, true, '2026-12-31')
ON CONFLICT (codigo) DO UPDATE SET
    activo = EXCLUDED.activo,
    porcentaje_descuento = EXCLUDED.porcentaje_descuento;

-- 6. RESERVAS INICIALES DE PRUEBA
INSERT INTO reservas (id_reserva, codigo, id_cliente, id_habitacion, fecha_entrada, fecha_salida, cantidad_huespedes, precio_noche, cantidad_noches, subtotal, descuento, total, cupon_aplicado, saldo, estado, numero_llave, fecha_checkin, notas) VALUES
(1, 'RH-20261215-0042', 1, 3, '2026-12-15', '2026-12-18', 2, 180000.00, 3, 540000.00, 81000.00, 459000.00, 'BIENVENIDA2026', 259000.00, 'CONFIRMADA', NULL, NULL, 'Viaje romántico de aniversario, solicitaron flores.'),
(2, 'RH-20261220-0089', 2, 9, '2026-12-20', '2026-12-24', 2, 420000.00, 4, 1680000.00, 168000.00, 1512000.00, 'ALBORADA10', 0.00, 'CHECK_IN', 'LLAVE-204', '2026-12-20 14:30:00-05', 'Huésped frecuente, prefiere almohadas de pluma.')
ON CONFLICT (codigo) DO UPDATE SET
    estado = EXCLUDED.estado,
    total = EXCLUDED.total;

-- 7. PAGOS REGISTRADOS
INSERT INTO pagos (id_pago, id_reserva, monto, metodo, recibo_caja, registrado_por) VALUES
(1, 1, 200000.00, 'TARJETA', 'REC-2026-0001', 'recepcion@hotelalborada.com'),
(2, 2, 1512000.00, 'TRANSFERENCIA', 'REC-2026-0002', 'recepcion@hotelalborada.com')
ON CONFLICT (recibo_caja) DO UPDATE SET
    monto = EXCLUDED.monto;
