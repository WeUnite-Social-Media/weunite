package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.post.Like;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.dto.LikeDTO;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface LikeMapper {

    @Mapping(target = "id", source = "like.id", resultType = String.class)
    @Mapping(target = "user", source = "like.user")
    @Mapping(target = "post", source = "like.post", qualifiedByName = "mapPostWithoutLikes")
    LikeDTO toLikeDTO(Like like);

    @Named("mapPostWithoutLikes")
    @Mapping(target = "id", source = "post.id", resultType = String.class)
    @Mapping(target = "text", source = "post.text")
    @Mapping(target = "imageUrl", source = "post.imageUrl")
    @Mapping(target = "likes", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "createdAt", source = "post.createdAt")
    @Mapping(target = "updatedAt", source = "post.updatedAt")
    @Mapping(target = "user", source = "post.user")
    PostDTO mapPostWithoutLikes(Post post);

    default ResponseDTO<LikeDTO> toResponseDTO(String message, Like like) {
        LikeDTO likeDTO = toLikeDTO(like);
        return new ResponseDTO<>(message, likeDTO);
    }

    default ResponseDTO<List<LikeDTO>> toResponseDTO(String message, Set<Like> likes) {
        List<LikeDTO> likeDTOs = mapLikes(likes);
        return new ResponseDTO<>(message, likeDTOs);
    }

    default ResponseDTO<List<LikeDTO>> toResponseDTO(String message, List<Like> likes) {
        List<LikeDTO> likeDTOs = mapLikes(likes);
        return new ResponseDTO<>(message, likeDTOs);
    }

    @Named("mapLikes")
    default List<LikeDTO> mapLikes(Set<Like> likes) {
        if (likes == null || likes.isEmpty()) {
            return List.of();
        }

        return likes.stream()
                .map(this::toLikeDTO)
                .collect(Collectors.toList());
    }

    @Named("mapLikesToList")
    default List<LikeDTO> mapLikes(List<Like> likes) {
        if (likes == null || likes.isEmpty()) {
            return List.of();
        }

        return likes.stream()
                .map(this::toLikeDTO)
                .collect(Collectors.toList());
    }
}
