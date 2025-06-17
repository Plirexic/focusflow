package de.hsesslingen.focusflowbackend.controller;

import de.hsesslingen.focusflowbackend.dto.AuthResponseDTO;
import de.hsesslingen.focusflowbackend.dto.UserRegistrationRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import de.hsesslingen.focusflowbackend.model.Team;
import de.hsesslingen.focusflowbackend.model.User;
import de.hsesslingen.focusflowbackend.repository.UserRepository;
import de.hsesslingen.focusflowbackend.repository.TeamRepository;
import de.hsesslingen.focusflowbackend.service.UserService;

import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
/**
 * UserController handles HTTP requests related to user management.
 * It provides endpoints for user registration, login, profile updates,
 * and team management.
 */
public class UserController {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<User> getUserById(@RequestParam Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/email")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registerUser(@RequestBody UserRegistrationRequestDTO registrationRequest) {
        if (registrationRequest.getPasswordConfirm() == null ||
            !registrationRequest.getPassword().equals(registrationRequest.getPasswordConfirm())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(null, null, null, null, null, "Password confirmation does not match"));
        }

        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT) 
                    .body(new AuthResponseDTO(null, null, null, null, null, "Email already registered"));
        }

        try {
            User newUser = new User();
            newUser.setEmail(registrationRequest.getEmail());
            newUser.setFirstName(registrationRequest.getFirstName());
            newUser.setLastName(registrationRequest.getLastName());
            newUser.setPassword(registrationRequest.getPassword());
            newUser.setRole("USER");

            User registeredUser = userService.registerUser(newUser);

            return ResponseEntity.ok(new AuthResponseDTO(
                registeredUser.getId(),
                registeredUser.getEmail(),
                registeredUser.getFirstName(),
                registeredUser.getLastName(),
                registeredUser.getRole(),
                "Registrierung erfolgreich!"
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponseDTO(null, null, null, null, null, e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unerwarteter Fehler während der Registrierung: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDTO(null, null, null, null, null, "Ein unerwarteter Serverfehler ist aufgetreten."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> loginUser(@RequestParam String email, @RequestParam String password) {
        boolean success = userService.loginUser(email, password);
        if (success) {
            User loggedInUser = userRepository.findByEmail(email)
                                            .orElseThrow(() -> new NoSuchElementException("Benutzer nicht gefunden nach erfolgreichem Login: " + email));
            return ResponseEntity.ok(new AuthResponseDTO(
                loggedInUser.getId(),
                loggedInUser.getEmail(),
                loggedInUser.getFirstName(),
                loggedInUser.getLastName(),
                loggedInUser.getRole(),
                "Login erfolgreich!"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponseDTO(null, null, null, null, null, "Ungültige Anmeldedaten."));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestParam String email, @RequestBody User updatedInfo) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        User user = optionalUser.get();
        user.setFirstName(updatedInfo.getFirstName());
        user.setLastName(updatedInfo.getLastName());
        user.setEmail(updatedInfo.getEmail());
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PutMapping("/role")
    public ResponseEntity<?> updateRole(@RequestParam Long id, @RequestParam String role) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        user.setRole(role);
        userRepository.save(user);

        return ResponseEntity.ok("User role updated to: " + role);
    }

    @PostMapping("/teams/add")
    public ResponseEntity<?> addUserToTeam(@RequestParam Long userId, @RequestParam Long teamId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (userOpt.isEmpty() || teamOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Team team = teamOpt.get();

        user.getTeams().add(team);
        team.getMembers().add(user);

        userRepository.save(user);
        teamRepository.save(team);

        return ResponseEntity.ok("User added to team.");
    }

    @DeleteMapping("/teams/delete")
    public ResponseEntity<?> removeUserFromTeam(@RequestParam Long userId, @RequestParam Long teamId) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Team> teamOpt = teamRepository.findById(teamId);
        if (userOpt.isEmpty() || teamOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        Team team = teamOpt.get();

        user.getTeams().remove(team);
        team.getMembers().remove(user);

        userRepository.save(user);
        teamRepository.save(team);

        return ResponseEntity.ok("User removed from team.");
    }
}