package com.monkapp.service;

import com.monkapp.dto.request.ProductoRequest;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public List<Producto> listar() {
        return productoRepository.findByUsuarioAndActivoTrue(getUsuario());
    }

    public List<Producto> listarStockBajo() {
        Usuario u = getUsuario();
        int umbral = u.getConfiguracion() != null ? u.getConfiguracion().getUmbralStock() : 5;
        return productoRepository.findByUsuarioAndActivoTrueAndStockLessThanEqualAndTieneInventarioTrue(u, umbral);
    }

    public Producto obtener(Long id) {
        return productoRepository.findByIdAndUsuario(id, getUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }

    public Producto crear(ProductoRequest req) {
        Producto p = new Producto();
        mapear(p, req);
        p.setUsuario(getUsuario());
        return productoRepository.save(p);
    }

    public Producto actualizar(Long id, ProductoRequest req) {
        Producto p = obtener(id);
        mapear(p, req);
        return productoRepository.save(p);
    }

    public void eliminar(Long id) {
        Producto p = obtener(id);
        p.setActivo(false);
        productoRepository.save(p);
    }

    private void mapear(Producto p, ProductoRequest req) {
        p.setNombre(req.getNombre());
        p.setDescripcion(req.getDescripcion());
        p.setPrecio(req.getPrecio());
        p.setStock(req.getStock() != null ? req.getStock() : 0);
        p.setCategoria(req.getCategoria());
        p.setTieneInventario(req.getTieneInventario());
        p.setStockMinimo(req.getStockMinimo() != null ? req.getStockMinimo() : 5);
    }
}
