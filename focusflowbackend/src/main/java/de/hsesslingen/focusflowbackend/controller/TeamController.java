package de.hsesslingen.focusflowbackend.controller;

import de.hsesslingen.focusflowbackend.model.Team;
import de.hsesslingen.focusflowbackend.service.TeamService;
import de.hsesslingen.focusflowbackend.dto.TeamCreationRequestDTO;
import de.hsesslingen.focusflowbackend.dto.TeamMemberRequestDTO;
import de.hsesslingen.focusflowbackend.dto.TeamUpdateRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
/**
 * TeamController handles HTTP requests related to teams.
 * It provides endpoints for creating teams, retrieving team information,
 * and managing team members.
 */
public class TeamController {

    private final TeamService teamService;

    // GET: Get all teams
    @GetMapping("/all")
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    // GET: Get team by ID
    @GetMapping()
    public ResponseEntity<Team> getTeamById(@RequestParam Long id) {
        return teamService.getTeamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Create a new team
    @PostMapping("/create")
    public ResponseEntity<?> createTeam(@RequestBody TeamCreationRequestDTO request) {
        try {
            Team createdTeam = teamService.createTeam(
                request.getName(),
                request.getDescription(),
                request.getMemberEmails(),
                request.getCreatorEmail()
            );

            String message = request.getMemberEmails() != null && !request.getMemberEmails().isEmpty()
                    ? "Team created successfully with members"
                    : "Team created successfully";

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", message,
                    "teamId", createdTeam.getId()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // GET: Get all teams for a user
    @GetMapping("/user")
    public ResponseEntity<List<Team>> getUserTeams(@RequestParam Long userId) {
        return ResponseEntity.ok(teamService.getTeamsForUser(userId));
    }

    // GET: Get all members of a team
    @GetMapping("/members")
    public ResponseEntity<List<Long>> getTeamMembers(@RequestParam Long teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    // POST: Add members to a team
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMembers(
            @PathVariable("id") Long teamId,
            @RequestBody TeamMemberRequestDTO request
    ) {
        Team updated = teamService.addMembers(teamId, request.getMemberEmails());
        return ResponseEntity.ok(Map.of(
            "message", "Mitglieder hinzugefügt",
            "teamId", updated.getId(),
            "memberCount", updated.getMembers().size()
        ));
    }

    // Edit the Team Name and Description
    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(
            @PathVariable Long id,
            @RequestBody TeamUpdateRequestDTO request) {
        try {
            Team updatedTeam = teamService.updateTeam(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(updatedTeam);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE: Delete a team by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
    try {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    } catch (RuntimeException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }
}
}
