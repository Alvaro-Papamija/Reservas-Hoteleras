package com.hotelalborada.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico debe tener un formato válido")
        private String correo;

        @NotBlank(message = "La contraseña es obligatoria")
        private String contrasena;

        public LoginRequest() {}

        public LoginRequest(String correo, String contrasena) {
            this.correo = correo;
            this.contrasena = contrasena;
        }

        public String getCorreo() {
            return correo;
        }

        public void setCorreo(String correo) {
            this.correo = correo;
        }

        public String getContrasena() {
            return contrasena;
        }

        public void setContrasena(String contrasena) {
            this.contrasena = contrasena;
        }
    }

    public static class RegistroRequest {
        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(min = 2, max = 150, message = "El nombre debe tener al menos 2 caracteres")
        private String nombre;

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El correo electrónico debe tener un formato válido")
        private String correo;

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres")
        private String contrasena;

        private String rol; // Opcional, por defecto CLIENTE

        public RegistroRequest() {}

        public RegistroRequest(String nombre, String correo, String contrasena, String rol) {
            this.nombre = nombre;
            this.correo = correo;
            this.contrasena = contrasena;
            this.rol = rol;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getCorreo() {
            return correo;
        }

        public void setCorreo(String correo) {
            this.correo = correo;
        }

        public String getContrasena() {
            return contrasena;
        }

        public void setContrasena(String contrasena) {
            this.contrasena = contrasena;
        }

        public String getRol() {
            return rol;
        }

        public void setRol(String rol) {
            this.rol = rol;
        }
    }

    public static class UsuarioResponse {
        private Long idUsuario;
        private String nombre;
        private String correo;
        private String rol;
        private Boolean estado;

        public UsuarioResponse() {}

        public UsuarioResponse(Long idUsuario, String nombre, String correo, String rol, Boolean estado) {
            this.idUsuario = idUsuario;
            this.nombre = nombre;
            this.correo = correo;
            this.rol = rol;
            this.estado = estado;
        }

        public Long getIdUsuario() {
            return idUsuario;
        }

        public void setIdUsuario(Long idUsuario) {
            this.idUsuario = idUsuario;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public String getCorreo() {
            return correo;
        }

        public void setCorreo(String correo) {
            this.correo = correo;
        }

        public String getRol() {
            return rol;
        }

        public void setRol(String rol) {
            this.rol = rol;
        }

        public Boolean getEstado() {
            return estado;
        }

        public void setEstado(Boolean estado) {
            this.estado = estado;
        }
    }

    public static class AuthResponse {
        private String token;
        private String tokenType = "Bearer";
        private long expiresInMs;
        private UsuarioResponse usuario;

        public AuthResponse() {}

        public AuthResponse(String token, long expiresInMs, UsuarioResponse usuario) {
            this.token = token;
            this.expiresInMs = expiresInMs;
            this.usuario = usuario;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }

        public long getExpiresInMs() {
            return expiresInMs;
        }

        public void setExpiresInMs(long expiresInMs) {
            this.expiresInMs = expiresInMs;
        }

        public UsuarioResponse getUsuario() {
            return usuario;
        }

        public void setUsuario(UsuarioResponse usuario) {
            this.usuario = usuario;
        }
    }

    public static class ErrorResponse {
        private String mensaje;
        private long timestamp;
        private int status;

        public ErrorResponse() {}

        public ErrorResponse(String mensaje, int status) {
            this.mensaje = mensaje;
            this.status = status;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMensaje() {
            return mensaje;
        }

        public void setMensaje(String mensaje) {
            this.mensaje = mensaje;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }

        public int getStatus() {
            return status;
        }

        public void setStatus(int status) {
            this.status = status;
        }
    }
}
