package com.monkapp.service;

import com.monkapp.dto.request.ClienteRequest;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Cliente> listar() {
        return clienteRepository.findByUsuarioAndActivoTrue(getUsuario());
    }

    public List<Cliente> listarConDeuda() {
        return clienteRepository.findClientesConDeuda(getUsuario());
    }

    public Cliente obtener(Long id) {
        return clienteRepository.findByIdAndUsuario(id, getUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
    }

    public Cliente crear(ClienteRequest req) {
        Cliente c = new Cliente();
        c.setNombre(req.getNombre());
        c.setIdentificacion(req.getIdentificacion());
        c.setTelefono(req.getTelefono());
        c.setCorreo(req.getCorreo());
        c.setUsuario(getUsuario());
        return clienteRepository.save(c);
    }

    public Cliente actualizar(Long id, ClienteRequest req) {
        Cliente c = obtener(id);
        c.setNombre(req.getNombre());
        c.setIdentificacion(req.getIdentificacion());
        c.setTelefono(req.getTelefono());
        c.setCorreo(req.getCorreo());
        return clienteRepository.save(c);
    }

    public void eliminar(Long id) {
        Cliente c = obtener(id);
        c.setActivo(false);
        clienteRepository.save(c);
    }
}
