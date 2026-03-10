package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.AuthDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.UserDTO;
import com.example.weuniteauth.dto.auth.*;
import com.example.weuniteauth.dto.user.CreateUserRequestDTO;
import com.example.weuniteauth.exceptions.auth.InvalidTokenException;
import com.example.weuniteauth.exceptions.auth.NotVerifiedEmailException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.AuthMapper;
import com.example.weuniteauth.service.jwt.JwtService;
import com.example.weuniteauth.service.mail.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Set;
import java.util.HashSet;
import com.example.weuniteauth.domain.users.Role;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthMapper authMapper;

    @Mock
    private JwtService jwtService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Should login successfully when credentials are valid and email is verified")
    void loginSuccess() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("testuser", "password123");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        // Set role as Set<Role> with BASIC
        Role basicRole = new Role();
        basicRole.setName("BASIC");
        Set<Role> roles = new HashSet<>();
        roles.add(basicRole);
        mockUser.setRole(roles);
        mockUser.setPassword("$2a$10$encodedPassword");
        mockUser.setEmailVerified(true);
        mockUser.setEmail("test@example.com");
        mockUser.setName("Test User");
        mockUser.setBio("Test Bio");
        mockUser.setCreatedAt(Instant.now());
        mockUser.setUpdatedAt(Instant.now());

        // Extract role name for UserDTO
        String roleName = mockUser.getRole().iterator().next().getName();
        UserDTO expectedUserDTO = new UserDTO(
                mockUser.getId().toString(),
                mockUser.getName(),
                mockUser.getUsername(),
                roleName,
                mockUser.getBio(),
                mockUser.getEmail(),
                mockUser.getProfileImg(),
                mockUser.getBannerImg(),
                mockUser.isPrivate(),
                mockUser.getCreatedAt(),
                mockUser.getUpdatedAt()
        );

        AuthDTO authData = new AuthDTO(
                expectedUserDTO,
                "jwt-token",
                3600L
        );

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Login realizado com sucesso!",
                authData
        );

        when(userService.findUserEntityByUsername("testuser")).thenReturn(mockUser);
        when(passwordEncoder.matches("password123", "$2a$10$encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(mockUser)).thenReturn("jwt-token");
        when(jwtService.getDefaultTokenExpirationTime()).thenReturn(3600L);
        when(authMapper.toResponseDTO("Login realizado com sucesso!", mockUser, "jwt-token", 3600L))
                .thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.login(loginRequest);

        assertNotNull(result);
        assertEquals("Login realizado com sucesso!", result.message());
        assertNotNull(result.data());
        assertEquals("testuser", result.data().user().username());
        assertEquals("jwt-token", result.data().jwt());
        assertEquals(3600L, result.data().expiresIn());

        verify(userService).findUserEntityByUsername("testuser");
        verify(passwordEncoder).matches("password123", "$2a$10$encodedPassword");
        verify(jwtService).generateToken(mockUser);
        verify(jwtService).getDefaultTokenExpirationTime();
        verify(authMapper).toResponseDTO("Login realizado com sucesso!", mockUser, "jwt-token", 3600L);
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist")
    void loginWithNonExistentUser() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("nonexistent", "password123");

        when(userService.findUserEntityByUsername("nonexistent"))
                .thenThrow(new UserNotFoundException());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> authService.login(loginRequest));

        assertNotNull(exception);
        verify(userService).findUserEntityByUsername("nonexistent");
        verifyNoInteractions(passwordEncoder, jwtService, authMapper);
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when password is incorrect")
    void loginWithWrongPassword() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("testuser", "wrongpassword");

        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("$2a$10$encodedPassword");
        mockUser.setEmailVerified(true);

        when(userService.findUserEntityByUsername("testuser")).thenReturn(mockUser);
        when(passwordEncoder.matches("wrongpassword", "$2a$10$encodedPassword")).thenReturn(false);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));

        assertEquals("Usuário ou senha inválidos", exception.getMessage());
        verify(userService).findUserEntityByUsername("testuser");
        verify(passwordEncoder).matches("wrongpassword", "$2a$10$encodedPassword");
        verifyNoInteractions(jwtService, authMapper);
    }

    @Test
    @DisplayName("Should throw NotVerifiedEmailException when email is not verified")
    void loginWithUnverifiedEmail() {
        LoginRequestDTO loginRequest = new LoginRequestDTO("testuser", "password123");

        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("$2a$10$encodedPassword");
        mockUser.setEmailVerified(false);

        when(userService.findUserEntityByUsername("testuser")).thenReturn(mockUser);
        when(passwordEncoder.matches("password123", "$2a$10$encodedPassword")).thenReturn(true);

        NotVerifiedEmailException exception = assertThrows(NotVerifiedEmailException.class, () -> authService.login(loginRequest));

        assertEquals("Verifique seu email para fazer login", exception.getMessage());
        verify(userService).findUserEntityByUsername("testuser");
        verify(passwordEncoder).matches("password123", "$2a$10$encodedPassword");
        verifyNoInteractions(jwtService, authMapper);
    }

    @Test
    @DisplayName("Should signup a user when the data doesn't already exist")
    void signUpSuccess() {
        CreateUserRequestDTO userRequestDTO = new CreateUserRequestDTO(
                "Luizao",
                "Luizada",
                "lgtgusmao@hotmail.com",
                "123456Cl@",
                "BASIC"
        );

        User mockUser = new User();
        mockUser.setUsername("Luizada");
        mockUser.setEmail("lgtgusmao@hotmail.com");
        mockUser.setVerificationToken("123456");

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Cadastro concluído! Verifique seu email",
                null
        );

        when(userService.createUser(userRequestDTO)).thenReturn(mockUser);
        when(authMapper.toResponseDTO("Cadastro concluído! Verifique seu email", mockUser))
                .thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.signUp(userRequestDTO);

        assertNotNull(result);
        assertEquals("Cadastro concluído! Verifique seu email", result.message());

        verify(userService).createUser(userRequestDTO);
        verify(emailService).sendVerificationEmailAsync("lgtgusmao@hotmail.com", "123456");
        verify(authMapper).toResponseDTO("Cadastro concluído! Verifique seu email", mockUser);
    }

    @Test
    @DisplayName("Should throw exception when userService.createUser fails")
    void signUpError() {
        CreateUserRequestDTO userRequestDTO = new CreateUserRequestDTO(
                "Luizao",
                "Luizada",
                "lgtgusmao@hotmail.com",
                "123456Cl@",
                "BASIC"
        );

        when(userService.createUser(userRequestDTO))
                .thenThrow(new RuntimeException("Erro ao criar usuário"));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.signUp(userRequestDTO));

        assertEquals("Erro ao criar usuário", exception.getMessage());
        verify(userService).createUser(userRequestDTO);
        verifyNoInteractions(emailService, authMapper);
    }

    @Test
    @DisplayName("Should verify email and return JWT when everything is correct")
    void verifyEmailSuccess() {
        String email = "test@example.com";
        String verificationToken = "123456";

        VerifyEmailRequestDTO verifyEmailRequestDTO = new VerifyEmailRequestDTO(verificationToken);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(email);
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setVerificationToken(verificationToken);
        mockUser.setEmailVerified(false);

        User verifiedUser = new User();
        verifiedUser.setId(1L);
        verifiedUser.setEmail(email);
        verifiedUser.setUsername("testuser");
        verifiedUser.setName("Test User");
        verifiedUser.setEmailVerified(true);

        // Prepare role for UserDTO
        String roleName = mockUser.getRole() != null && !mockUser.getRole().isEmpty() ? mockUser.getRole().iterator().next().getName() : "BASIC";
        UserDTO expectedUserDTO = new UserDTO(
                mockUser.getId().toString(),
                mockUser.getName(),
                mockUser.getUsername(),
                roleName,
                mockUser.getBio(),
                mockUser.getEmail(),
                mockUser.getProfileImg(),
                mockUser.getBannerImg(),
                mockUser.isPrivate(),
                mockUser.getCreatedAt(),
                mockUser.getUpdatedAt()
        );

        AuthDTO authData = new AuthDTO(
                expectedUserDTO,
                "jwt-token",
                3600L
        );

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Email verificado com sucesso!",
                authData
        );

        when(userService.findUserEntityByEmail(email)).thenReturn(mockUser);
        when(userService.verifyUserEmail(mockUser)).thenReturn(verifiedUser);
        when(jwtService.generateToken(mockUser)).thenReturn("jwt-token");
        when(jwtService.getDefaultTokenExpirationTime()).thenReturn(3600L);
        when(authMapper.toResponseDTO("Email verificado com sucesso!", mockUser, "jwt-token", 3600L))
                .thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.verifyEmail(verifyEmailRequestDTO, email);

        assertNotNull(result);
        assertEquals("Email verificado com sucesso!", result.message());
        assertNotNull(result.data());

        verify(userService).findUserEntityByEmail(email);
        verify(userService).verifyUserEmail(mockUser);
        verify(jwtService).generateToken(mockUser);
        verify(jwtService).getDefaultTokenExpirationTime();
        verify(emailService).sendWelcomeEmail(email, "Test User");
        verify(authMapper).toResponseDTO("Email verificado com sucesso!", mockUser, "jwt-token", 3600L);
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user is not found by email")
    void verifyEmailWithUserNotFound() {
        String email = "nonexistent@example.com";
        String verificationToken = "123456";

        VerifyEmailRequestDTO verifyEmailRequestDTO = new VerifyEmailRequestDTO(verificationToken);

        when(userService.findUserEntityByEmail(email))
                .thenThrow(new UserNotFoundException());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> authService.verifyEmail(verifyEmailRequestDTO, email));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail(email);
        verifyNoInteractions(jwtService, emailService, authMapper);
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when user has no verification token")
    void verifyEmailWithNullToken() {
        String email = "test@example.com";
        String requestToken = "123456";

        VerifyEmailRequestDTO verifyEmailRequestDTO = new VerifyEmailRequestDTO(requestToken);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(email);
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setVerificationToken(null);
        mockUser.setEmailVerified(false);

        when(userService.findUserEntityByEmail(email)).thenReturn(mockUser);

        InvalidTokenException exception = assertThrows(InvalidTokenException.class, () -> authService.verifyEmail(verifyEmailRequestDTO, email));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail(email);
        verifyNoInteractions(jwtService, emailService, authMapper);
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when verification token does not match")
    void verifyEmailWithInvalidToken() {
        String email = "test@example.com";
        String correctToken = "123456";
        String wrongToken = "654321";

        VerifyEmailRequestDTO verifyEmailRequestDTO = new VerifyEmailRequestDTO(wrongToken);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(email);
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setVerificationToken(correctToken);
        mockUser.setEmailVerified(false);

        when(userService.findUserEntityByEmail(email)).thenReturn(mockUser);

        InvalidTokenException exception = assertThrows(InvalidTokenException.class, () -> authService.verifyEmail(verifyEmailRequestDTO, email));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail(email);
        verifyNoInteractions(jwtService, emailService, authMapper);
    }

    @Test
    @DisplayName("Should send reset password email successfully when user exists and email is verified")
    void sendResetPasswordSuccess() {
        SendResetPasswordRequestDTO requestDTO = new SendResetPasswordRequestDTO("test@example.com");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setEmailVerified(true);
        mockUser.setVerificationToken("123456");

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Código enviado!",
                null
        );

        when(userService.findUserEntityByEmail("test@example.com")).thenReturn(mockUser);
        when(userService.generateAndSetToken(mockUser)).thenReturn(mockUser);
        when(authMapper.toResponseDTO("Código enviado!")).thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.sendResetPassword(requestDTO);

        assertNotNull(result);
        assertEquals("Código enviado!", result.message());

        verify(userService).findUserEntityByEmail("test@example.com");
        verify(userService).generateAndSetToken(mockUser);
        verify(emailService).sendPasswordResetRequestEmail("test@example.com", "123456");
        verify(authMapper).toResponseDTO("Código enviado!");
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist")
    void sendResetPasswordWithNonExistentUser() {
        SendResetPasswordRequestDTO requestDTO = new SendResetPasswordRequestDTO("nonexistent@example.com");

        when(userService.findUserEntityByEmail("nonexistent@example.com"))
                .thenThrow(new UserNotFoundException());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> authService.sendResetPassword(requestDTO));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail("nonexistent@example.com");
        verifyNoInteractions(emailService, authMapper);
        verify(userService, never()).generateAndSetToken(any(User.class));
    }

    @Test
    @DisplayName("Should throw NotVerifiedEmailException when user email is not verified")
    void sendResetPasswordWithUnverifiedEmail() {
        SendResetPasswordRequestDTO requestDTO = new SendResetPasswordRequestDTO("unverified@example.com");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("unverified@example.com");
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setEmailVerified(false);

        when(userService.findUserEntityByEmail("unverified@example.com")).thenReturn(mockUser);

        NotVerifiedEmailException exception = assertThrows(NotVerifiedEmailException.class, () -> authService.sendResetPassword(requestDTO));

        assertEquals("Verifique seu e-mail para redefinir a senha", exception.getMessage());
        verify(userService).findUserEntityByEmail("unverified@example.com");
        verifyNoInteractions(emailService, authMapper);
        verify(userService, never()).generateAndSetToken(any(User.class));
    }

    @Test
    @DisplayName("Should verify reset password token successfully when token matches")
    void verifyResetPasswordTokenSuccess() {
        String email = "test@example.com";
        String verificationToken = "123456";
        VerifyResetTokenRequestDTO requestDTO = new VerifyResetTokenRequestDTO(verificationToken);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(email);
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setVerificationToken(verificationToken);

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Código verificado!",
                null
        );

        when(userService.findUserEntityByEmail(email)).thenReturn(mockUser);
        when(authMapper.toResponseDTO("Código verificado!")).thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.verifyResetPasswordToken(requestDTO, email);

        assertNotNull(result);
        assertEquals("Código verificado!", result.message());

        verify(userService).findUserEntityByEmail(email);
        verify(authMapper).toResponseDTO("Código verificado!");
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist")
    void verifyResetPasswordTokenWithNonExistentUser() {
        String email = "nonexistent@example.com";
        String verificationToken = "123456";
        VerifyResetTokenRequestDTO requestDTO = new VerifyResetTokenRequestDTO(verificationToken);

        when(userService.findUserEntityByEmail(email))
                .thenThrow(new UserNotFoundException());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> authService.verifyResetPasswordToken(requestDTO, email));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail(email);
        verifyNoInteractions(authMapper);
    }

    @Test
    @DisplayName("Should throw InvalidTokenException when token does not match")
    void verifyResetPasswordTokenWithInvalidToken() {
        String email = "test@example.com";
        String correctToken = "123456";
        String wrongToken = "654321";
        VerifyResetTokenRequestDTO requestDTO = new VerifyResetTokenRequestDTO(wrongToken);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail(email);
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setVerificationToken(correctToken);

        when(userService.findUserEntityByEmail(email)).thenReturn(mockUser);

        InvalidTokenException exception = assertThrows(InvalidTokenException.class, () -> authService.verifyResetPasswordToken(requestDTO, email));

        assertNotNull(exception);
        verify(userService).findUserEntityByEmail(email);
        verifyNoInteractions(authMapper);
    }

    @Test
    @DisplayName("Should reset password successfully when verification token is valid")
    void resetPasswordSuccess() {
        String verificationToken = "123456";
        String newPassword = "newPassword123@";
        String encodedPassword = "$2a$10$encodedNewPassword";
        ResetPasswordRequestDTO requestDTO = new ResetPasswordRequestDTO(newPassword);

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        mockUser.setUsername("testuser");
        mockUser.setName("Test User");
        mockUser.setPassword("oldEncodedPassword");
        mockUser.setVerificationToken(verificationToken);

        ResponseDTO<AuthDTO> expectedResponse = new ResponseDTO<>(
                "Senha redefinida!",
                null
        );

        when(userService.findUserByVerificationToken(verificationToken)).thenReturn(mockUser);
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);
        when(authMapper.toResponseDTO("Senha redefinida!")).thenReturn(expectedResponse);

        ResponseDTO<AuthDTO> result = authService.resetPassword(requestDTO, verificationToken);

        assertNotNull(result);
        assertEquals("Senha redefinida!", result.message());

        assertEquals(encodedPassword, mockUser.getPassword());
        assertNull(mockUser.getVerificationToken());
        assertNull(mockUser.getVerificationTokenExpires());

        verify(userService).findUserByVerificationToken(verificationToken);
        verify(passwordEncoder).encode(newPassword);
        verify(emailService).sendPasswordResetSuccessEmail("test@example.com");
        verify(authMapper).toResponseDTO("Senha redefinida!");
    }

    @Test
    @DisplayName("Should throw exception when verification token is not found")
    void resetPasswordWithInvalidToken() {
        String invalidToken = "invalid123";
        String newPassword = "newPassword123@";
        ResetPasswordRequestDTO requestDTO = new ResetPasswordRequestDTO(newPassword);

        when(userService.findUserByVerificationToken(invalidToken))
                .thenThrow(new UserNotFoundException());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () -> authService.resetPassword(requestDTO, invalidToken));

        assertNotNull(exception);
        verify(userService).findUserByVerificationToken(invalidToken);
        verifyNoInteractions(passwordEncoder, emailService, authMapper);
    }
}

