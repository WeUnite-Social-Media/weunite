package com.weunite.api.users.service;

import com.weunite.api.auth.exception.ExpiredTokenException;
import com.weunite.api.auth.exception.InvalidTokenException;
import com.weunite.api.common.exception.NotFoundResourceException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.storage.service.CloudinaryService;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.repository.SkillRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.CreateUserRequestDTO;
import com.weunite.api.users.dto.UpdateUserRequestDTO;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.exception.UserAlreadyExistsException;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.mapper.UserMapper;
import com.weunite.api.users.repository.RoleRepository;
import com.weunite.api.users.repository.UserRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

  private static final int TOKEN_EXPIRATION_MINUTES = 10;

  private final UserRepository userRepository;
  private final UserMapper userMapper;
  private final PasswordEncoder passwordEncoder;
  private final RoleRepository roleRepository;
  private final CloudinaryService cloudinaryService;
  private final SkillRepository skillRepository;

  public UserService(
      UserRepository userRepository,
      UserMapper userMapper,
      PasswordEncoder passwordEncoder,
      RoleRepository roleRepository,
      CloudinaryService cloudinaryService,
      SkillRepository skillRepository) {
    this.userRepository = userRepository;
    this.userMapper = userMapper;
    this.passwordEncoder = passwordEncoder;
    this.roleRepository = roleRepository;
    this.cloudinaryService = cloudinaryService;
    this.skillRepository = skillRepository;
  }

  @Transactional
  public User createUser(CreateUserRequestDTO userDTO) {
    boolean userExists =
        userRepository.existsByUsernameOrEmail(userDTO.username(), userDTO.email());

    if (userExists) {
      throw new UserAlreadyExistsException();
    }

    String encodedPassword = passwordEncoder.encode(userDTO.password());

    User newUser = userMapper.toEntity(userDTO);

    newUser.setPassword(encodedPassword);

    Role roleUser = roleRepository.findByName(userDTO.role().toUpperCase());
    if (roleUser == null) {
      throw new NotFoundResourceException("Role not found: " + userDTO.role());
    }

    newUser.setRole(Set.of(roleUser));
    newUser = generateAndSetToken(newUser);
    userRepository.save(newUser);

    return newUser;
  }

  @Transactional(isolation = Isolation.REPEATABLE_READ)
  public ResponseDTO<UserDTO> deleteUser(String username) {
    User user =
        userRepository.findByUsername(username).orElseThrow(() -> new UserNotFoundException());

    user.getRole().clear();

    userRepository.delete(user);

    return userMapper.toResponseDTO("Usuario deletado com sucesso", user);
  }

  @Transactional(isolation = Isolation.REPEATABLE_READ)
  public ResponseDTO<UserDTO> deleteBanner(String username) {
    User user =
        userRepository.findByUsername(username).orElseThrow(() -> new UserNotFoundException());

    user.setBannerImg(null);

    userRepository.save(user);

    return userMapper.toResponseDTO("Banner deletado com sucesso", user);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<UserDTO> getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow(UserNotFoundException::new);

    return userMapper.toResponseDTO("Usuario encontrado com sucesso", user);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<UserDTO> getUser(String username) {
    User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);

    return userMapper.toResponseDTO("Usuario encontrado com sucesso", user);
  }

  @Transactional
  public ResponseDTO<UserDTO> updateUser(
      UpdateUserRequestDTO requestDTO,
      String username,
      MultipartFile profileImage,
      MultipartFile bannerImage) {
    User user = findUserEntityByUsername(username);
    String updatedUsername = valueOrCurrent(requestDTO.username(), user.getUsername());

    if (!user.getUsername().equals(updatedUsername)
        && userRepository.existsByUsername(updatedUsername)) {
      throw new UserAlreadyExistsException();
    }

    user.setUsername(updatedUsername);
    user.setName(valueOrCurrent(requestDTO.name(), user.getName()));
    user.setBio(nullableOrCurrent(requestDTO.bio(), user.getBio()));

    if (requestDTO.isPrivate() != null) {
      user.setPrivate(requestDTO.isPrivate());
    }

    if (profileImage != null && !profileImage.isEmpty()) {
      String imageUrl = cloudinaryService.uploadProfileImg(profileImage, user.getUsername());
      user.setProfileImg(imageUrl);
    }

    if (bannerImage != null && !bannerImage.isEmpty()) {
      String bannerUrl = cloudinaryService.uploadBannerImg(bannerImage, user.getUsername());
      user.setBannerImg(bannerUrl);
    }

    if (user instanceof Athlete athlete) {
      applyAthleteProfileUpdates(athlete, requestDTO);
    }

    userRepository.save(user);

    return userMapper.toResponseDTO("Usuario atualizado com sucesso!", user);
  }

  private void applyAthleteProfileUpdates(Athlete athlete, UpdateUserRequestDTO requestDTO) {
    athlete.setHeight(requestDTO.height());
    athlete.setWeight(requestDTO.weight());
    athlete.setFootDomain(blankToNull(requestDTO.footDomain()));
    athlete.setPosition(blankToNull(requestDTO.position()));
    athlete.setBirthDate(requestDTO.birthDate());

    if (requestDTO.skills() != null) {
      athlete.setSkills(resolveSkills(requestDTO.skills()));
    }
  }

  private LinkedHashSet<Skill> resolveSkills(List<SkillDTO> requestedSkills) {
    LinkedHashSet<Skill> resolvedSkills = new LinkedHashSet<>();

    for (SkillDTO requestedSkill : requestedSkills) {
      String skillName = blankToNull(requestedSkill.name());
      if (skillName == null) {
        continue;
      }

      Skill existingSkill = skillRepository.findByName(skillName);
      if (existingSkill != null) {
        resolvedSkills.add(existingSkill);
        continue;
      }

      resolvedSkills.add(skillRepository.save(new Skill(skillName)));
    }

    return resolvedSkills;
  }

  private String valueOrCurrent(String value, String currentValue) {
    String normalizedValue = blankToNull(value);
    return normalizedValue != null ? normalizedValue : currentValue;
  }

  private String nullableOrCurrent(String value, String currentValue) {
    return value != null ? blankToNull(value) : currentValue;
  }

  private String blankToNull(String value) {
    if (value == null) {
      return null;
    }

    String trimmedValue = value.trim();
    return trimmedValue.isEmpty() ? null : trimmedValue;
  }

  @Transactional(readOnly = true)
  public User findUserEntityByUsername(String username) {
    return userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
  }

  @Transactional(readOnly = true)
  public User findUserEntityById(Long userId) {
    return userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
  }

  @Transactional(readOnly = true)
  public User findUserEntityByEmail(String email) {
    return userRepository.findByEmail(email).orElseThrow(UserNotFoundException::new);
  }

  @Transactional(readOnly = true)
  public User findUserByVerificationToken(String verificationToken) {
    return userRepository
        .findByVerificationToken(verificationToken)
        .orElseThrow(InvalidTokenException::new);
  }

  @Transactional
  public User verifyUserEmail(User user) {
    Instant now = Instant.now();

    if (user.getVerificationTokenExpires().isBefore(now)) {
      throw new ExpiredTokenException();
    }

    user.setEmailVerified(true);
    user.setVerificationToken(null);
    user.setVerificationTokenExpires(null);

    return userRepository.save(user);
  }

  public User generateAndSetToken(User user) {
    SecureRandom generator = new SecureRandom();
    int randomNumber = 100000 + generator.nextInt(900000);

    Instant now = Instant.now();
    Instant expirationDate = now.plusSeconds(TOKEN_EXPIRATION_MINUTES * 60);

    user.setVerificationToken(String.valueOf(randomNumber));
    user.setVerificationTokenExpires(expirationDate);

    return user;
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<UserDTO>> searchUsers(String query) {

    List<User> users = userRepository.searchUsers(query.trim());

    return userMapper.toSearchResponseDTO("Usuarios encontrados com sucesso", users);
  }
}
