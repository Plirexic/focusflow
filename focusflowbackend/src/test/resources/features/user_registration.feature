Feature: User Registration in Focusflow
    As a new user,
    I want to register for an FocusFlow account with secure credentials,
    So that I can access the Focusflow platform and manage my tasks securely

Scenario: Register with valid credentials
    Given I am on the registration page
    When I enter a "chris@example.com" as the email
    And I enter "Chris" as the first name
    And I enter "Meyer" as the last name
    And I enter "StrongP@ss1!" as the password
    And I confirm the password "StrongP@ss1!"
    And I click the "Register" registration button
    Then I should see the registration success message "Registration successful!"

Scenario: Password missing uppercase letter
    Given I am on the registration page
    When I enter a "user@example.com" as the email
    And I enter "Test" as the first name
    And I enter "User" as the last name
    And I enter "lowercase1!" as the password
    And I confirm the password "lowercase1!"
    And I click the "Register" registration button
    Then I should see the user registration error message "Password must contain at least one uppercase letter"
    And I should remain on the user registration page

Scenario: Password confirmation does not match
    Given I am on the registration page
    When I enter a "kevin@aol.com" as the email
    And I enter "Test" as the first name
    And I enter "User" as the last name
    And I enter "ValidP@ss1!" as the password
    And I confirm the password "InvalidP@ss1!"
    And I click the "Register" registration button
    Then I should see the user registration error message "Password confirmation does not match" 
    And I should remain on the user registration page 

Scenario: Email already registered
    Given I am on the registration page
    And a user with email "existing.user@example.com" and password "ValidP@ss1!" is already registered
    When I enter a "existing.user@example.com" as the email
    And I enter "Test" as the first name
    And I enter "User" as the last name
    And I enter "AnotherValidP@ss1!" as the password
    And I confirm the password "AnotherValidP@ss1!"
    And I click the "Register" registration button
    Then I should see the user registration error message "Email already registered"
    And I should remain on the user registration page