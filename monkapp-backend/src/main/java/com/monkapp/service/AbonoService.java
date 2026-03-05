package com.monkapp.service;

import com.monkapp.dto.request.AbonoRequest;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AbonoService {

    private final AbonoRepository abonoRepository;
    private final ClienteRepository clienteRepository;
    private final VentaRepository ventaRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Abono> listarPorCliente(Long clienteId) {
        Usuario u = getUsuario();
        Cliente c = clienteRepository.findByIdAndUsuario(clienteId, u)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
        return abonoRepository.findByClienteAndUsuarioOrderByFechaDesc(c, u);
    }

    public Abono registrar(AbonoRequest req) {
        Usuario u = getUsuario();
        Cliente c = clienteRepository.findByIdAndUsuario(req.getClienteId(), u)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        if (req.getMonto().compareTo(c.getDeudaTotal()) > 0)
            throw new BusinessException("El monto supera la deuda del cliente ($" + c.getDeudaTotal() + ")");

        c.setDeudaTotal(c.getDeudaTotal().subtract(req.getMonto()).max(BigDecimal.ZERO));
        clienteRepository.save(c);

        if (req.getVentaId() != null) {
            ventaRepository.findByIdAndUsuario(req.getVentaId(), u).ifPresent(v -> {
                v.setSaldoPendiente(v.getSaldoPendiente().subtract(req.getMonto()).max(BigDecimal.ZERO));
                if (v.getSaldoPendiente().compareTo(BigDecimal.ZERO) == 0)
                    v.setEstado(Venta.EstadoVenta.PAGADA);
                ventaRepository.save(v);
            });
        }

        Abono a = new Abono();
        a.setFecha(req.getFecha() != null ? req.getFecha() : LocalDate.now());
        a.setTitulo(req.getTitulo());
        a.setObservacion(req.getObservacion());
        a.setMonto(req.getMonto());
        a.setCliente(c);
        a.setUsuario(u);
        if (req.getVentaId() != null)
            ventaRepository.findById(req.getVentaId()).ifPresent(a::setVenta);
        return abonoRepository.save(a);
    }
}
