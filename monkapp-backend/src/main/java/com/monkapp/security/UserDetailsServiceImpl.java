package com.monkapp.security;

import com.monkapp.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String cedula) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + cedula));
        return User.builder()
                .username(usuario.getCedula())
                .password(usuario.getPassword())
                .roles("USER")
                .build();
    }
}
