package de.hsesslingen.focusflowbackend.service;

import org.springframework.stereotype.Service;

import de.hsesslingen.focusflowbackend.model.Team;
import de.hsesslingen.focusflowbackend.model.User;
import de.hsesslingen.focusflowbackend.repository.UserRepository;
import de.hsesslingen.focusflowbackend.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
// This service class is responsible for handling user-related operations
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final BCryptPasswordEncoder passwordEncoder; 

    // Method: Register a user with valid credentials
    public User registerUser(User user) {

        // Validate email format and password policies
        validateUser(user); 

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Method: Login validation: check email and password match
    public boolean loginUser(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                user.setLastLogin(LocalDateTime.now()); // Update last login time
                userRepository.save(user);
                return true;
            } else {
                return false;
            }
        }
        return false;
    }

    // Validation: Validate user credentials (email format and password policy)
    private void validateUser(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty() || !user.getEmail().contains("@")) {
            throw new IllegalArgumentException("Invalid email format or email is empty");
        }
        validatePassword(user.getPassword());
    }

    // Validation: Validate password with detailed checks
    private void validatePassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("Password must not be null");
        }

        if (password.length() < 10 || password.length() > 12) { 
            throw new IllegalArgumentException("Password must be between 10 and 12 characters long");
        }

        if (!containsUppercase(password)) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }

        if (!containsLowercase(password)) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }

        if (!containsSpecialChar(password)) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }
    }

    // Method: Assign role to user
    public User assignRole(User user, String role) {
        user.setRole(role.toUpperCase());
        return userRepository.save(user);
    }

    // Method: Add user to team
    public void addUserToTeam(User user, Team team) {
        userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        teamRepository.findById(team.getId()).orElseThrow(() -> new RuntimeException("Team not found"));

        user.getTeams().add(team);
        team.getMembers().add(user);
        userRepository.save(user);
    }

    // Method: Remove user from team
    public void removeUserFromTeam(User user, Team team) {
        user.getTeams().remove(team);
        team.getMembers().remove(user);
        userRepository.save(user);
    }

    // Helper method: Check if password contains at least one uppercase letter
    private boolean containsUppercase(String password) {
        return password.chars().anyMatch(Character::isUpperCase);
    }

    // Helper method: Check if password contains at least one lowercase letter
    private boolean containsLowercase(String password) {
        return password.chars().anyMatch(Character::isLowerCase);
    }

    // Helper method: Check if password contains at least one special character
    // Specific set of special characters "!@#$%^&*()_+-=[]{};':\",./<>?"
    private boolean containsSpecialChar(String password) {
        String specialChars = "!@#$%^&*()_+-=[]{};':\",./<>?";
        return password.chars().anyMatch(ch -> specialChars.indexOf(ch) >= 0);
    }
}