package com.monkapp.service;

import com.monkapp.dto.request.*;
import com.monkapp.dto.response.*;
import com.monkapp.entity.*;
import com.monkapp.exception.*;
import com.monkapp.repository.UsuarioRepository;
import com.monkapp.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final ConfiguracionService configuracionService;

    public ApiResponse registrar(RegistroRequest req) {
        if (usuarioRepository.existsByCedula(req.getCedula()))
            throw new BusinessException("La cédula ya está registrada");
        if (usuarioRepository.existsByCorreo(req.getCorreo()))
            throw new BusinessException("El correo ya está registrado");

        String codigo = String.format("%06d", new Random().nextInt(999999));

        Usuario u = new Usuario();
        u.setCedula(req.getCedula());
        u.setNombre(req.getNombre());
        u.setCorreo(req.getCorreo());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setCodigoVerificacion(codigo);
        u.setCodigoExpiracion(LocalDateTime.now().plusMinutes(10));
        u.setVerificado(false);
        usuarioRepository.save(u);

        configuracionService.crearPorDefecto(u);
        emailService.enviarCodigo(req.getCorreo(), req.getNombre(), codigo);

        return new ApiResponse(true, "Registro exitoso. Revisa tu correo en los próximos 10 minutos.");
    }

    public ApiResponse verificar(VerificacionRequest req) {
        Usuario u = usuarioRepository.findByCorreo(req.getCorreo())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (u.getVerificado()) return new ApiResponse(true, "Cuenta ya verificada");
        if (LocalDateTime.now().isAfter(u.getCodigoExpiracion()))
            throw new BusinessException("El código ha expirado. Solicita uno nuevo.");
        if (!u.getCodigoVerificacion().equals(req.getCodigo()))
            throw new BusinessException("Código incorrecto");

        u.setVerificado(true);
        u.setCodigoVerificacion(null);
        u.setCodigoExpiracion(null);
        usuarioRepository.save(u);
        return new ApiResponse(true, "¡Cuenta verificada! Ya puedes iniciar sesión.");
    }

    public ApiResponse reenviarCodigo(String correo) {
        Usuario u = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        if (u.getVerificado()) return new ApiResponse(true, "La cuenta ya está verificada");

        String codigo = String.format("%06d", new Random().nextInt(999999));
        u.setCodigoVerificacion(codigo);
        u.setCodigoExpiracion(LocalDateTime.now().plusMinutes(10));
        usuarioRepository.save(u);
        emailService.enviarCodigo(correo, u.getNombre(), codigo);
        return new ApiResponse(true, "Nuevo código enviado a tu correo");
    }

    public AuthResponse login(LoginRequest req) {
        Usuario u = usuarioRepository.findByCedula(req.getCedula())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        if (!passwordEncoder.matches(req.getPassword(), u.getPassword()))
            throw new BusinessException("Credenciales inválidas");
        if (!u.getVerificado())
            throw new BusinessException("Debes verificar tu correo antes de iniciar sesión");
        if (!u.getActivo())
            throw new BusinessException("Tu cuenta está desactivada");

        String token = jwtUtil.generateToken(u.getCedula(), u.getCorreo());
        return new AuthResponse(token, u.getCedula(), u.getNombre(), u.getCorreo());
    }
}
