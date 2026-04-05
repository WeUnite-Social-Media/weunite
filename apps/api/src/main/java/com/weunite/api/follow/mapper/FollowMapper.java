package com.weunite.api.follow.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.domain.Follow;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.users.mapper.UserMapper;
import java.util.List;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class})
public interface FollowMapper {

  @Mapping(target = "id", source = "follow.id", resultType = String.class)
  @Mapping(target = "follower", source = "follow.follower")
  @Mapping(target = "followed", source = "follow.followed")
  @Mapping(target = "status", source = "follow.status")
  @Mapping(target = "createdAt", source = "follow.createdAt")
  @Mapping(target = "updatedAt", source = "follow.updatedAt")
  FollowDTO toFollowDTO(Follow follow);

  default ResponseDTO<FollowDTO> toResponseDTO(String message, Follow follow) {
    FollowDTO followDTO = toFollowDTO(follow);
    return new ResponseDTO<>(message, followDTO);
  }

  default ResponseDTO<List<FollowDTO>> toResponseDTO(String message, List<Follow> follows) {
    List<FollowDTO> followDTOs = mapFollows(follows);
    return new ResponseDTO<>(message, followDTOs);
  }

  @Named("mapFollowsToList")
  default List<FollowDTO> mapFollows(List<Follow> follows) {
    if (follows == null || follows.isEmpty()) {
      return List.of();
    }

    return follows.stream().map(this::toFollowDTO).collect(Collectors.toList());
  }
}
