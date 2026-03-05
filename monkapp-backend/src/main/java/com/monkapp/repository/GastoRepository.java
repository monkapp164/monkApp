package com.monkapp.repository;

import com.monkapp.entity.Gasto;
import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByUsuarioOrderByFechaDesc(Usuario usuario);
    Optional<Gasto> findByIdAndUsuario(Long id, Usuario usuario);

    @Query("SELECT COALESCE(SUM(g.saldoPendiente), 0) FROM Gasto g WHERE g.usuario = :usuario")
    BigDecimal sumSaldoPendienteByUsuario(Usuario usuario);
}
