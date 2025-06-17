package de.hsesslingen.focusflowbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Dieses DTO wird vom Backend gesendet, um Informationen nach Login/Registrierung zu übermitteln
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private Long userId;        
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;    
}