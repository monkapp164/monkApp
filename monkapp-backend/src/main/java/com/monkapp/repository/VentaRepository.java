package com.monkapp.repository;

import com.monkapp.entity.Cliente;
import com.monkapp.entity.Usuario;
import com.monkapp.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findByUsuarioOrderByFechaDesc(Usuario usuario);
    List<Venta> findByClienteAndUsuario(Cliente cliente, Usuario usuario);
    Optional<Venta> findByIdAndUsuario(Long id, Usuario usuario);
    List<Venta> findByUsuarioAndFechaBetweenOrderByFechaDesc(
            Usuario usuario, LocalDate inicio, LocalDate fin);

    @Query("SELECT COALESCE(SUM(v.saldoPendiente), 0) FROM Venta v " +
           "WHERE v.usuario = :usuario AND v.estado = 'ACTIVA'")
    BigDecimal sumSaldoPendienteByUsuario(Usuario usuario);
}
