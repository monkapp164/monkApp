package com.monkapp.service;

import com.monkapp.dto.request.GastoRequest;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GastoService {

    private final GastoRepository gastoRepository;
    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Gasto> listar() {
        return gastoRepository.findByUsuarioOrderByFechaDesc(getUsuario());
    }

    public Gasto obtener(Long id) {
        return gastoRepository.findByIdAndUsuario(id, getUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));
    }

    public Gasto crear(GastoRequest req) {
        Usuario u = getUsuario();
        Gasto g = new Gasto();
        g.setFecha(req.getFecha() != null ? req.getFecha() : LocalDate.now());
        g.setCategoria(req.getCategoria());
        g.setValor(req.getValor());
        g.setDescripcion(req.getDescripcion());
        g.setMetodoPago(req.getMetodoPago());
        g.setUsuario(u);

        BigDecimal pagado = req.getValorPagado() != null ? req.getValorPagado() : req.getValor();
        g.setValorPagado(pagado);
        g.setSaldoPendiente(req.getValor().subtract(pagado).max(BigDecimal.ZERO));

        if (req.getProveedorId() != null) {
            proveedorRepository.findByIdAndUsuario(req.getProveedorId(), u).ifPresent(p -> {
                if (g.getSaldoPendiente().compareTo(BigDecimal.ZERO) > 0) {
                    p.setDeudaTotal(p.getDeudaTotal().add(g.getSaldoPendiente()));
                    proveedorRepository.save(p);
                }
                g.setProveedor(p);
            });
        }
        return gastoRepository.save(g);
    }

    public void eliminar(Long id) {
        gastoRepository.delete(obtener(id));
    }
}
