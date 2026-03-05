package com.monkapp.repository;

import com.monkapp.entity.Proveedor;
import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    List<Proveedor> findByUsuario(Usuario usuario);
    Optional<Proveedor> findByIdAndUsuario(Long id, Usuario usuario);
}
