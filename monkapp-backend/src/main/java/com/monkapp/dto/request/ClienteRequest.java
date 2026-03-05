package com.monkapp.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClienteRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;
    private String identificacion;
    private String telefono;
    private String correo;
}
