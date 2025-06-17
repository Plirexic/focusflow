package de.hsesslingen.focusflowbackend.dto;

import lombok.Data;

@Data
public class TeamUpdateRequestDTO {
    private String name;
    private String description;
}