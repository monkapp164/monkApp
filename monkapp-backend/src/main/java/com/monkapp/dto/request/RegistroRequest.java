package com.monkapp.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistroRequest {
    @NotBlank(message = "La cédula es obligatoria")
    @Size(min = 5, max = 20, message = "Cédula entre 5 y 20 caracteres")
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    @Pattern(regexp = "\\d{4}", message = "La contraseña debe ser de exactamente 4 dígitos numéricos")
    private String password;
}
