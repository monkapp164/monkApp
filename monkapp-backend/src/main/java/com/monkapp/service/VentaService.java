package com.monkapp.service;

import com.monkapp.dto.request.*;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Venta> listarPorCliente(Long clienteId) {
        Usuario usuario = getUsuario();
        Cliente c = clienteRepository.findByIdAndUsuario(clienteId, usuario)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
        return ventaRepository.findByClienteAndUsuario(c, usuario);
    }

    public List<Venta> listar() {
        return ventaRepository.findByUsuarioOrderByFechaDesc(getUsuario());
    }

    public Venta obtener(Long id) {
        return ventaRepository.findByIdAndUsuario(id, getUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada"));
    }

    public Venta crear(VentaRequest req) {
        Usuario usuario = getUsuario();
        Venta venta = new Venta();
        venta.setFecha(req.getFecha() != null ? req.getFecha() : LocalDate.now());
        venta.setTipoVenta(req.getTipoVenta());
        venta.setMetodoPago(req.getMetodoPago());
        venta.setConcepto(req.getConcepto());
        venta.setNumeroCuotas(req.getNumeroCuotas() != null ? req.getNumeroCuotas() : 1);
        venta.setUsuario(usuario);

        BigDecimal total = BigDecimal.ZERO;
        List<DetalleVenta> detalles = new ArrayList<>();

        for (DetalleRequest dr : req.getDetalles()) {
            DetalleVenta det = new DetalleVenta();
            if (req.getTipoVenta() == Venta.TipoVenta.CON_INVENTARIO) {
                Producto prod = productoRepository.findByIdAndUsuario(dr.getProductoId(), usuario)
                        .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
                if (prod.getTieneInventario() && prod.getStock() < dr.getCantidad())
                    throw new BusinessException("Stock insuficiente para: " + prod.getNombre());
                if (prod.getTieneInventario()) {
                    prod.setStock(prod.getStock() - dr.getCantidad());
                    productoRepository.save(prod);
                }
                det.setProducto(prod);
                det.setNombreProducto(prod.getNombre());
                det.setPrecioUnitario(prod.getPrecio());
            } else {
                det.setNombreProducto(dr.getNombreProducto());
                det.setPrecioUnitario(dr.getPrecioUnitario());
            }
            det.setCantidad(dr.getCantidad());
            BigDecimal sub = det.getPrecioUnitario().multiply(BigDecimal.valueOf(dr.getCantidad()));
            det.setSubtotal(sub);
            det.setVenta(venta);
            detalles.add(det);
            total = total.add(sub);
        }

        BigDecimal descuento = req.getDescuento() != null ? req.getDescuento() : BigDecimal.ZERO;
        total = total.subtract(descuento).max(BigDecimal.ZERO);
        BigDecimal abono = req.getAbonoInicial() != null ? req.getAbonoInicial() : BigDecimal.ZERO;
        BigDecimal saldo = total.subtract(abono).max(BigDecimal.ZERO);

        venta.setTotal(total);
        venta.setDescuento(descuento);
        venta.setAbonoInicial(abono);
        venta.setSaldoPendiente(saldo);
        venta.setDetalles(detalles);

        if (saldo.compareTo(BigDecimal.ZERO) > 0) {
            if (req.getClienteId() == null)
                throw new BusinessException("Se requiere un cliente cuando hay saldo pendiente");
            Cliente c = clienteRepository.findByIdAndUsuario(req.getClienteId(), usuario)
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
            c.setDeudaTotal(c.getDeudaTotal().add(saldo));
            clienteRepository.save(c);
            venta.setCliente(c);
        } else {
            venta.setEstado(Venta.EstadoVenta.PAGADA);
            if (req.getClienteId() != null) {
                clienteRepository.findByIdAndUsuario(req.getClienteId(), usuario)
                        .ifPresent(venta::setCliente);
            }
        }
        return ventaRepository.save(venta);
    }

    public void anular(Long id) {
        Venta v = obtener(id);
        if (v.getEstado() == Venta.EstadoVenta.ANULADA)
            throw new BusinessException("La venta ya está anulada");

        if (v.getTipoVenta() == Venta.TipoVenta.CON_INVENTARIO && v.getDetalles() != null) {
            v.getDetalles().forEach(det -> {
                if (det.getProducto() != null && det.getProducto().getTieneInventario()) {
                    det.getProducto().setStock(det.getProducto().getStock() + det.getCantidad());
                    productoRepository.save(det.getProducto());
                }
            });
        }
        if (v.getCliente() != null && v.getSaldoPendiente().compareTo(BigDecimal.ZERO) > 0) {
            Cliente c = v.getCliente();
            c.setDeudaTotal(c.getDeudaTotal().subtract(v.getSaldoPendiente()).max(BigDecimal.ZERO));
            clienteRepository.save(c);
        }
        v.setEstado(Venta.EstadoVenta.ANULADA);
        ventaRepository.save(v);
    }
}