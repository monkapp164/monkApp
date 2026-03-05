package com.monkapp.repository;

import com.monkapp.entity.Cliente;
import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByUsuarioAndActivoTrue(Usuario usuario);
    Optional<Cliente> findByIdAndUsuario(Long id, Usuario usuario);

    @Query("SELECT c FROM Cliente c WHERE c.usuario = :usuario " +
           "AND c.activo = true AND c.deudaTotal > 0 ORDER BY c.deudaTotal DESC")
    List<Cliente> findClientesConDeuda(Usuario usuario);
}
