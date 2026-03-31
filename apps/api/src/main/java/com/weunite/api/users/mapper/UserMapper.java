package com.weunite.api.users.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.CreateUserRequestDTO;
import com.weunite.api.users.dto.UserDTO;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  default User toEntity(CreateUserRequestDTO dto) {
    String role = dto.role().toUpperCase();

    User user =
        switch (role) {
          case "ATHLETE" -> new Athlete();
          case "COMPANY" -> new Company();
          default -> throw new IllegalArgumentException("Tipo de usuario invalido: " + role);
        };

    user.setUsername(dto.username());
    user.setEmail(dto.email());
    user.setName(dto.name());

    return user;
  }

  @Mapping(target = "id", source = "user.id", resultType = String.class)
  @Mapping(target = "name", source = "user.name")
  @Mapping(target = "username", source = "user.username")
  @Mapping(target = "role", expression = "java(mapPrimaryRole(user))")
  @Mapping(target = "bio", source = "user.bio")
  @Mapping(target = "email", source = "user.email")
  @Mapping(target = "profileImg", source = "user.profileImg")
  @Mapping(target = "bannerImg", source = "user.bannerImg")
  @Mapping(target = "isPrivate", source = "user.private")
  @Mapping(target = "createdAt", source = "user.createdAt")
  @Mapping(target = "updatedAt", source = "user.updatedAt")
  @Mapping(target = "height", expression = "java(mapHeight(user))")
  @Mapping(target = "weight", expression = "java(mapWeight(user))")
  @Mapping(target = "footDomain", expression = "java(mapFootDomain(user))")
  @Mapping(target = "position", expression = "java(mapPosition(user))")
  @Mapping(target = "birthDate", expression = "java(mapBirthDate(user))")
  @Mapping(target = "skills", expression = "java(mapSkills(user))")
  UserDTO toUserDTO(User user);

  List<UserDTO> toUserDTOList(List<User> users);

  default Double mapHeight(User user) {
    return user instanceof Athlete athlete ? athlete.getHeight() : null;
  }

  default Double mapWeight(User user) {
    return user instanceof Athlete athlete ? athlete.getWeight() : null;
  }

  default String mapFootDomain(User user) {
    return user instanceof Athlete athlete ? athlete.getFootDomain() : null;
  }

  default String mapPosition(User user) {
    return user instanceof Athlete athlete ? athlete.getPosition() : null;
  }

  default LocalDate mapBirthDate(User user) {
    return user instanceof Athlete athlete ? athlete.getBirthDate() : null;
  }

  default List<SkillDTO> mapSkills(User user) {
    if (!(user instanceof Athlete athlete)) {
      return List.of();
    }

    return toSkillDTOList(athlete.getSkills());
  }

  default List<SkillDTO> toSkillDTOList(Set<Skill> skills) {
    if (skills == null || skills.isEmpty()) {
      return List.of();
    }

    return skills.stream()
        .map(skill -> new SkillDTO(skill.getId(), skill.getName()))
        .collect(Collectors.toList());
  }

  default String mapPrimaryRole(User user) {
    Set<String> roles =
        user.getRole().stream().map(Role::getName).collect(Collectors.toSet());

    if (roles.contains("ADMIN")) {
      return "ADMIN";
    }

    if (roles.contains("COMPANY")) {
      return "COMPANY";
    }

    if (roles.contains("ATHLETE")) {
      return "ATHLETE";
    }

    return roles.stream().findFirst().orElse("BASIC");
  }

  default ResponseDTO<UserDTO> toResponseDTO(String message, User user) {
    UserDTO userDTO = toUserDTO(user);
    return new ResponseDTO<>(message, userDTO);
  }

  default ResponseDTO<List<UserDTO>> toSearchResponseDTO(String message, List<User> users) {
    List<UserDTO> userDTOs = toUserDTOList(users);
    return new ResponseDTO<>(message, userDTOs);
  }
}
