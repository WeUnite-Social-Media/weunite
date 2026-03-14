package com.weunite.api.auth.mapper;

import com.weunite.api.auth.dto.AuthDTO;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class})
public interface AuthMapper {

  @Mapping(target = "user", source = "user")
  @Mapping(target = "jwt", source = "jwt")
  @Mapping(target = "expiresIn", source = "expiresIn")
  AuthDTO toAuthDTO(User user, String jwt, Long expiresIn);

  default ResponseDTO<AuthDTO> toResponseDTO(
      String message, User user, String jwt, Long expiresIn) {
    AuthDTO authDTO = toAuthDTO(user, jwt, expiresIn);
    return new ResponseDTO<>(message, authDTO);
  }

  default ResponseDTO<AuthDTO> toResponseDTO(String message) {
    return new ResponseDTO<>(message, null);
  }

  default ResponseDTO<AuthDTO> toResponseDTO(String message, User user) {
    AuthDTO authDTO = toAuthDTO(user, null, null);
    return new ResponseDTO<>(message, authDTO);
  }
}
