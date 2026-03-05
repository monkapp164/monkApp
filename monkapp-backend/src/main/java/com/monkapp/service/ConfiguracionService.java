package com.monkapp.service;

import com.monkapp.entity.*;
import com.monkapp.exception.ResourceNotFoundException;
import com.monkapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final UsuarioRepository usuarioRepository;

    public void crearPorDefecto(Usuario u) {
        ConfiguracionUsuario cfg = new ConfiguracionUsuario();
        cfg.setUsuario(u);
        u.setConfiguracion(cfg);
        usuarioRepository.save(u);
    }

    private Usuario getUsuario() {
        String cedula = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByCedula(cedula)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public ConfiguracionUsuario obtener() {
        return getUsuario().getConfiguracion();
    }

    public ConfiguracionUsuario actualizar(ConfiguracionUsuario req) {
        Usuario u = getUsuario();
        ConfiguracionUsuario cfg = u.getConfiguracion();
        cfg.setModoOscuro(req.getModoOscuro());
        cfg.setMoneda(req.getMoneda());
        cfg.setNotifCobro(req.getNotifCobro());
        cfg.setNotifStockBajo(req.getNotifStockBajo());
        cfg.setUmbralStock(req.getUmbralStock());
        cfg.setNotifProveedores(req.getNotifProveedores());
        cfg.setModoOffline(req.getModoOffline());
        cfg.setBackupAutomatico(req.getBackupAutomatico());
        cfg.setTwoFactor(req.getTwoFactor());
        cfg.setHistorialAuditoria(req.getHistorialAuditoria());
        cfg.setColorPrimario(req.getColorPrimario());
        cfg.setColorSecundario(req.getColorSecundario());
        cfg.setLogoUrl(req.getLogoUrl());
        usuarioRepository.save(u);
        return cfg;
    }
}
