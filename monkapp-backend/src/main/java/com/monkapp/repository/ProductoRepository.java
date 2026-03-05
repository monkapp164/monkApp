package com.monkapp.repository;

import com.monkapp.entity.Producto;
import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByUsuarioAndActivoTrue(Usuario usuario);
    Optional<Producto> findByIdAndUsuario(Long id, Usuario usuario);
    List<Producto> findByUsuarioAndActivoTrueAndCategoria(Usuario usuario, String categoria);
    List<Producto> findByUsuarioAndActivoTrueAndStockLessThanEqualAndTieneInventarioTrue(
            Usuario usuario, Integer stock);
}
