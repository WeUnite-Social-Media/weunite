package com.weunite.api.auth.service;

import com.weunite.api.auth.dto.AuthDTO;
import com.weunite.api.auth.dto.LoginRequestDTO;
import com.weunite.api.auth.dto.ResetPasswordRequestDTO;
import com.weunite.api.auth.dto.SendResetPasswordRequestDTO;
import com.weunite.api.auth.dto.VerifyEmailRequestDTO;
import com.weunite.api.auth.dto.VerifyResetTokenRequestDTO;
import com.weunite.api.auth.exception.InvalidTokenException;
import com.weunite.api.auth.exception.NotVerifiedEmailException;
import com.weunite.api.auth.mapper.AuthMapper;
import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.mail.service.EmailService;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.security.service.JwtService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.CreateUserRequestDTO;
import com.weunite.api.users.service.UserService;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private static final ZoneId BRAZIL_ZONE_ID = ZoneId.of("America/Sao_Paulo");
  private static final Locale BRAZIL_LOCALE = new Locale("pt", "BR");
  private static final DateTimeFormatter SUSPENSION_DATE_FORMATTER =
      DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy 'às' HH:mm", BRAZIL_LOCALE);

  private final UserService userService;
  private final PasswordEncoder passwordEncoder;
  private final AuthMapper authMapper;
  private final JwtService jwtService;
  private final EmailService emailService;

  public AuthService(
      UserService userService,
      PasswordEncoder passwordEncoder,
      AuthMapper authMapper,
      JwtService jwtService,
      EmailService emailService) {
    this.userService = userService;
    this.passwordEncoder = passwordEncoder;
    this.authMapper = authMapper;
    this.jwtService = jwtService;
    this.emailService = emailService;
  }

  @Transactional
  public ResponseDTO<AuthDTO> login(LoginRequestDTO requestDTO) {
    User user = userService.findUserEntityByUsername(requestDTO.username());

    if (!passwordEncoder.matches(requestDTO.password(), user.getPassword())) {
      throw new UnauthorizedException("Usuário ou senha inválidos");
    }

    if (!user.isEmailVerified()) {
      throw new NotVerifiedEmailException("Verifique seu email para fazer login");
    }

    ensureUserCanLogin(user);

    String jwtValue = jwtService.generateToken(user);
    Long expiresIn = jwtService.getDefaultTokenExpirationTime();

    return authMapper.toResponseDTO("Login realizado com sucesso!", user, jwtValue, expiresIn);
  }

  @Transactional
  public ResponseDTO<AuthDTO> signUp(CreateUserRequestDTO requestDTO) {
    User newUser = userService.createUser(requestDTO);

    emailService.sendVerificationEmailAsync(requestDTO.email(), newUser.getVerificationToken());

    return authMapper.toResponseDTO("Cadastro concluído! Verifique seu email", newUser);
  }

  @Transactional
  public ResponseDTO<AuthDTO> verifyEmail(VerifyEmailRequestDTO requestDTO, String email) {
    User user = userService.findUserEntityByEmail(email);

    if (user.getVerificationToken() == null) {
      throw new InvalidTokenException();
    }

    if (!user.getVerificationToken().equals(requestDTO.verificationToken())) {
      throw new InvalidTokenException();
    }

    userService.verifyUserEmail(user);

    String jwtValue = jwtService.generateToken(user);
    Long expiresIn = jwtService.getDefaultTokenExpirationTime();

    emailService.sendWelcomeEmail(user.getEmail(), user.getName());
    return authMapper.toResponseDTO("Email verificado com sucesso!", user, jwtValue, expiresIn);
  }

  @Transactional
  public ResponseDTO<AuthDTO> sendResetPassword(SendResetPasswordRequestDTO requestDTO) {
    User user = userService.findUserEntityByEmail(requestDTO.email());

    if (!user.isEmailVerified()) {
      throw new NotVerifiedEmailException("Verifique seu e-mail para redefinir a senha");
    }

    userService.generateAndSetToken(user);
    emailService.sendPasswordResetRequestEmail(requestDTO.email(), user.getVerificationToken());

    return authMapper.toResponseDTO("Código enviado!");
  }

  @Transactional
  public ResponseDTO<AuthDTO> verifyResetPasswordToken(
      VerifyResetTokenRequestDTO requestDTO, String email) {
    User user = userService.findUserEntityByEmail(email);

    if (!user.getVerificationToken().equals(requestDTO.verificationToken())) {
      throw new InvalidTokenException();
    }

    return authMapper.toResponseDTO("Código verificado!");
  }

  @Transactional
  public ResponseDTO<AuthDTO> resetPassword(
      ResetPasswordRequestDTO requestDTO, String verificationToken) {
    User user = userService.findUserByVerificationToken(verificationToken);

    user.setPassword(passwordEncoder.encode(requestDTO.newPassword()));
    user.setVerificationToken(null);
    user.setVerificationTokenExpires(null);

    emailService.sendPasswordResetSuccessEmail(user.getEmail());
    return authMapper.toResponseDTO("Senha redefinida!");
  }

  private void ensureUserCanLogin(User user) {
    if (user.isBanned()) {
      throw new UnauthorizedException("Sua conta foi banida permanentemente da plataforma");
    }

    if (!user.isSuspended()) {
      return;
    }

    Instant suspendedUntil = user.getSuspendedUntil();
    if (suspendedUntil != null && Instant.now().isBefore(suspendedUntil)) {
      throw new UnauthorizedException(
          String.format("Sua conta está suspensa até %s", formatSuspensionDate(suspendedUntil)));
    }

    user.setSuspended(false);
    user.setSuspendedUntil(null);
    user.setSuspensionReason(null);
  }

  private String formatSuspensionDate(Instant suspendedUntil) {
    return suspendedUntil.atZone(BRAZIL_ZONE_ID).format(SUSPENSION_DATE_FORMATTER);
  }
}
