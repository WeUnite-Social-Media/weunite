package com.weunite.api.posts.mapper;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.dto.RepostDTO;
import com.weunite.api.users.mapper.UserMapper;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(
    componentModel = "spring",
    uses = {UserMapper.class})
public interface RepostMapper {

  @Mapping(target = "id", source = "repost.id", resultType = String.class)
  @Mapping(target = "user", source = "repost.user")
  @Mapping(target = "post", source = "repost.post", qualifiedByName = "mapPostWithoutReposts")
  RepostDTO toRepostDTO(Repost repost);

  @Named("mapPostWithoutReposts")
  @Mapping(target = "id", source = "post.id", resultType = String.class)
  @Mapping(target = "text", source = "post.text")
  @Mapping(target = "imageUrl", source = "post.imageUrl")
  @Mapping(target = "likes", ignore = true)
  @Mapping(target = "comments", ignore = true)
  @Mapping(target = "reposts", ignore = true)
  @Mapping(target = "createdAt", source = "post.createdAt")
  @Mapping(target = "updatedAt", source = "post.updatedAt")
  @Mapping(target = "user", source = "post.user")
  @Mapping(target = "repostedBy", ignore = true)
  @Mapping(target = "repostedAt", ignore = true)
  PostDTO mapPostWithoutReposts(Post post);

  default ResponseDTO<RepostDTO> toResponseDTO(String message, Repost repost) {
    return new ResponseDTO<>(message, toRepostDTO(repost));
  }

  @Named("mapReposts")
  default List<RepostDTO> mapReposts(Set<Repost> reposts) {
    if (reposts == null || reposts.isEmpty()) {
      return List.of();
    }

    return reposts.stream().map(this::toRepostDTO).collect(Collectors.toList());
  }
}
