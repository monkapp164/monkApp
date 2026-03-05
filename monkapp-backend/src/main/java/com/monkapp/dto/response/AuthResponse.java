package com.monkapp.dto.response;
import lombok.*;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String cedula;
    private String nombre;
    private String correo;
}
