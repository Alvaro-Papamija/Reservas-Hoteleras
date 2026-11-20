package com.hotelalborada.backend.service;

import com.hotelalborada.backend.dto.ClienteDTOs.*;
import com.hotelalborada.backend.model.Cliente;
import com.hotelalborada.backend.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    public List<ClienteResponse> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Optional<ClienteResponse> buscarPorId(Long id) {
        return clienteRepository.findById(id).map(this::mapToResponse);
    }

    public Optional<ClienteResponse> buscarPorDocumento(String documento) {
        return clienteRepository.findByDocumento(documento).map(this::mapToResponse);
    }

    @Transactional
    public ClienteResponse registrar(ClienteRequest request) {
        if (clienteRepository.existsByDocumento(request.getDocumento())) {
            throw new IllegalArgumentException("Ya existe un cliente registrado con el documento: " + request.getDocumento());
        }

        Cliente cliente = new Cliente(
                null,
                request.getIdUsuario(),
                request.getNombre().trim(),
                request.getApellido().trim(),
                request.getTipoDocumento(),
                request.getDocumento().trim(),
                request.getTelefono().trim(),
                request.getCorreo().toLowerCase().trim(),
                request.getDireccion() != null ? request.getDireccion().trim() : null
        );

        Cliente guardado = clienteRepository.save(cliente);
        return mapToResponse(guardado);
    }

    @Transactional
    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con id: " + id));

        cliente.setNombre(request.getNombre().trim());
        cliente.setApellido(request.getApellido().trim());
        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setTelefono(request.getTelefono().trim());
        cliente.setCorreo(request.getCorreo().toLowerCase().trim());
        if (request.getDireccion() != null) {
            cliente.setDireccion(request.getDireccion().trim());
        }

        Cliente actualizado = clienteRepository.save(cliente);
        return mapToResponse(actualizado);
    }

    public ClienteResponse mapToResponse(Cliente c) {
        return new ClienteResponse(
                c.getIdCliente(),
                c.getIdUsuario(),
                c.getNombre(),
                c.getApellido(),
                c.getTipoDocumento(),
                c.getDocumento(),
                c.getTelefono(),
                c.getCorreo(),
                c.getDireccion(),
                c.getFechaRegistro()
        );
    }
}
