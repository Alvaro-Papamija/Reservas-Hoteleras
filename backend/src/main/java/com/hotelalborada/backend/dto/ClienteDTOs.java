package com.hotelalborada.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ClienteDTOs {

    public static class ClienteRequest {
        private Long idUsuario;

        @NotBlank(message = "El primer nombre es obligatorio")
        private String nombre;

        @NotBlank(message = "El apellido es obligatorio")
        private String apellido;

        private String tipoDocumento = "CC";

        @NotBlank(message = "El número de documento es obligatorio")
        private String documento;

        @NotBlank(message = "El teléfono de contacto es obligatorio")
        private String telefono;

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El formato de correo no es válido")
        private String correo;

        private String direccion;

        public ClienteRequest() {}

        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getApellido() { return apellido; }
        public void setApellido(String apellido) { this.apellido = apellido; }

        public String getTipoDocumento() { return tipoDocumento; }
        public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

        public String getDocumento() { return documento; }
        public void setDocumento(String documento) { this.documento = documento; }

        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }

        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
    }

    public static class ClienteResponse {
        private Long idCliente;
        private Long idUsuario;
        private String nombre;
        private String apellido;
        private String tipoDocumento;
        private String documento;
        private String telefono;
        private String correo;
        private String direccion;
        private LocalDateTime fechaRegistro;

        public ClienteResponse() {}

        public ClienteResponse(Long idCliente, Long idUsuario, String nombre, String apellido,
                               String tipoDocumento, String documento, String telefono,
                               String correo, String direccion, LocalDateTime fechaRegistro) {
            this.idCliente = idCliente;
            this.idUsuario = idUsuario;
            this.nombre = nombre;
            this.apellido = apellido;
            this.tipoDocumento = tipoDocumento;
            this.documento = documento;
            this.telefono = telefono;
            this.correo = correo;
            this.direccion = direccion;
            this.fechaRegistro = fechaRegistro;
        }

        public Long getIdCliente() { return idCliente; }
        public void setIdCliente(Long idCliente) { this.idCliente = idCliente; }

        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getApellido() { return apellido; }
        public void setApellido(String apellido) { this.apellido = apellido; }

        public String getTipoDocumento() { return tipoDocumento; }
        public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

        public String getDocumento() { return documento; }
        public void setDocumento(String documento) { this.documento = documento; }

        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }

        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }

        public LocalDateTime getFechaRegistro() { return fechaRegistro; }
        public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    }
}
