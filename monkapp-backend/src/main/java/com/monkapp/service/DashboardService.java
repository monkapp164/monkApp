package com.monkapp.service;

import com.monkapp.dto.response.DashboardResponse;
import com.monkapp.entity.Usuario;
import com.monkapp.exception.ResourceNotFoundException;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VentaRepository ventaRepository;
    private final GastoRepository gastoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardResponse obtener() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario u = usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        DashboardResponse d = new DashboardResponse();
        d.setTotalPorCobrar(ventaRepository.sumSaldoPendienteByUsuario(u));
        d.setTotalPorPagar(gastoRepository.sumSaldoPendienteByUsuario(u));
        d.setTotalClientes((long) clienteRepository.findByUsuarioAndActivoTrue(u).size());
        d.setTotalProductos((long) productoRepository.findByUsuarioAndActivoTrue(u).size());
        d.setClientesConDeuda(clienteRepository.findClientesConDeuda(u));
        return d;
    }
}
