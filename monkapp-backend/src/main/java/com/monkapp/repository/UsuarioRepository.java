package com.monkapp.repository;

import com.monkapp.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByCedula(String cedula);
    Optional<Usuario> findByCorreo(String correo);
    boolean existsByCedula(String cedula);
    boolean existsByCorreo(String correo);
}
