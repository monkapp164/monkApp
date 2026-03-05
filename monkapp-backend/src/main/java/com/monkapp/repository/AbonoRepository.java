package com.monkapp.repository;

import com.monkapp.entity.Abono;
import com.monkapp.entity.Cliente;
import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AbonoRepository extends JpaRepository<Abono, Long> {
    List<Abono> findByClienteAndUsuarioOrderByFechaDesc(Cliente cliente, Usuario usuario);
    List<Abono> findByUsuarioOrderByFechaDesc(Usuario usuario);
    Optional<Abono> findByIdAndUsuario(Long id, Usuario usuario);
}
