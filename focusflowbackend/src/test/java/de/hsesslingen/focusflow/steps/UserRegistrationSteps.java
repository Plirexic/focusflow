package de.hsesslingen.focusflow.steps;

import de.hsesslingen.focusflowbackend.FocusflowbackendApplication;
import io.cucumber.java.Before;
import io.cucumber.java.en.*;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.MediaType;
import de.hsesslingen.focusflowbackend.model.User;
import de.hsesslingen.focusflowbackend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals; 
import static org.junit.jupiter.api.Assertions.assertTrue;  
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    classes = FocusflowbackendApplication.class
)
@ActiveProfiles("test")
@AutoConfigureMockMvc
@CucumberContextConfiguration
@Transactional
// This class is used to define the steps for user registration scenarios in Cucumber tests
public class UserRegistrationSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String confirmPassword;
    private MvcResult result;

    @Before
    public void setup() {
        System.out.println("======== SETTING UP USER REGISTRATION TEST ========");
        // No specific setup needed for each scenario
        System.out.println("======== USER REGISTRATION TEST SETUP COMPLETE ========");
    }
    
    @Given("I am on the registration page")
    public void i_am_on_the_registration_page() {
        
    }

    @Given("a user with email {string} and password {string} is already registered")
    public void a_user_with_email_and_password_is_already_registered(String existingEmail, String existingPassword) {
        userRepository.flush();
        User existingUser = new User();
        existingUser.setEmail(existingEmail);
        existingUser.setPassword(passwordEncoder.encode(existingPassword));
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setRole("USER");
        userRepository.saveAndFlush(existingUser);
        assertTrue(userRepository.findByEmail(existingEmail).isPresent(), "Pre-existing user should be in DB");
    }

    @When("I enter a {string} as the email") 
    public void i_enter_a_as_the_email(String email) { 
        this.email = email;
    }

    @And("I enter {string} as the first name")
    public void i_enter_first_name(String firstName) {
        this.firstName = firstName;
    }

    @And("I enter {string} as the last name")
    public void i_enter_last_name(String lastName) {
        this.lastName = lastName;
    }

    @And("I enter {string} as the password")
    public void i_enter_password(String password) {
        this.password = password;
    }

    @And("I confirm the password {string}")
    public void i_confirm_password(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    @And("I click the {string} registration button")
    public void i_click_register_button(String buttonName) throws Exception { 
        if (!"Register".equalsIgnoreCase(buttonName)) {
            throw new IllegalArgumentException("This step is specific to the 'Register' button.");
        }

        String requestBody = String.format(
            "{\"email\":\"%s\",\"firstName\":\"%s\",\"lastName\":\"%s\",\"password\":\"%s\",\"passwordConfirm\":\"%s\"}",
            this.email, this.firstName, this.lastName, this.password, this.confirmPassword
        );

        this.result = mockMvc.perform(post("/api/user/register") 
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andReturn();
    }

    @Then("I should see the registration success message {string}") 
    public void i_should_see_registration_success_message(String expectedMessage) throws Exception {
        int statusCode = this.result.getResponse().getStatus();
        assertEquals(200, statusCode, "Expected HTTP status 200 for successful registration.");
    }

    @Then("I should see the user registration error message {string}") 
    public void i_should_see_the_user_registration_error_message(String expectedErrorMessage) throws Exception {
        String content = this.result.getResponse().getContentAsString();
        int statusCode = this.result.getResponse().getStatus();

        assertTrue((statusCode == 400 || statusCode == 409), "Expected HTTP status 400 or 409 for registration error.");
        assertTrue(content.contains(expectedErrorMessage), "Response body should contain the error message: " + expectedErrorMessage);
    }

    @Then("I should remain on the user registration page") 
    public void i_should_remain_on_the_user_registration_page() {
        int statusCode = this.result.getResponse().getStatus();
        assertTrue(statusCode != 200, "Should not see success message on registration error.");
    }
}