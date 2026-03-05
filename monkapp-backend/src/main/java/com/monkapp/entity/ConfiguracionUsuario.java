package com.monkapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuracion_usuario")
@Data
@NoArgsConstructor
public class ConfiguracionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Apariencia
    @Column(name = "modo_oscuro")
    private Boolean modoOscuro = false;

    @Column(length = 10)
    private String idioma = "es";

    @Column(length = 10)
    private String moneda = "COP";

    // Notificaciones
    @Column(name = "notif_cobro")
    private Boolean notifCobro = true;

    @Column(name = "notif_stock_bajo")
    private Boolean notifStockBajo = true;

    @Column(name = "umbral_stock")
    private Integer umbralStock = 5;

    @Column(name = "notif_proveedores")
    private Boolean notifProveedores = true;

    // Sincronización
    @Column(name = "modo_offline")
    private Boolean modoOffline = false;

    @Column(name = "backup_automatico")
    private Boolean backupAutomatico = false;

    // Seguridad
    @Column(name = "two_factor")
    private Boolean twoFactor = false;

    @Column(name = "historial_auditoria")
    private Boolean historialAuditoria = false;

    // Personalización
    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "color_primario", length = 7)
    private String colorPrimario = "#6C63FF";

    @Column(name = "color_secundario", length = 7)
    private String colorSecundario = "#FF6584";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_cedula", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario usuario;
}
