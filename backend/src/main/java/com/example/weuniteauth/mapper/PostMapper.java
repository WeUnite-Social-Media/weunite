package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Like;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.dto.CommentDTO;
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
public interface PostMapper {

    @Mapping(target = "id", source = "post.id", resultType = String.class)
    @Mapping(target = "text", source = "post.text")
    @Mapping(target = "imageUrl", source = "post.imageUrl")
    @Mapping(target = "likes", source = "post.likes", qualifiedByName = "mapLikesWithoutPost")
    @Mapping(target = "comments", source = "post.comments", qualifiedByName = "mapCommentsWithoutPost")
    @Mapping(target = "createdAt", source = "post.createdAt")
    @Mapping(target = "updatedAt", source = "post.updatedAt")
    @Mapping(target = "user", source = "post.user")
    PostDTO toPostDTO(Post post);

    default ResponseDTO<PostDTO> toResponseDTO(String message, Post post) {
        PostDTO postDTO = toPostDTO(post);
        return new ResponseDTO<>(message, postDTO);
    }

    default List<PostDTO> toPostDTOList(List<Post> posts) {
        if (posts == null || posts.isEmpty()) {
            return List.of();
        }

        return posts.stream()
                .map(this::toPostDTO)
                .collect(Collectors.toList());
    }

    @Named("mapLikeWithoutPost")
    @Mapping(target = "id", source = "like.id", resultType = String.class)
    @Mapping(target = "user", source = "like.user")
    @Mapping(target = "post", ignore = true)
    LikeDTO mapLikeWithoutPost(Like like);

    @Named("mapLikesWithoutPost")
    default List<LikeDTO> mapLikesWithoutPost(Set<Like> likes) {
        if (likes == null || likes.isEmpty()) {
            return List.of();
        }

        return likes.stream()
                .map(this::mapLikeWithoutPost)
                .collect(Collectors.toList());
    }

    @Named("mapCommentWithoutPost")
    @Mapping(target = "id", source = "comment.id", resultType = String.class)
    @Mapping(target = "user", source = "comment.user")
    @Mapping(target = "post", ignore = true)
    @Mapping(target = "text", source = "comment.text")
    @Mapping(target = "imageUrl", source = "comment.imageUrl")
    @Mapping(target = "parentComment", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "createdAt", source = "comment.createdAt")
    @Mapping(target = "updatedAt", source = "comment.updatedAt")
    CommentDTO mapCommentWithoutPost(Comment comment);

    @Named("mapCommentsWithoutPost")
    default List<CommentDTO> mapCommentsWithoutPost(List<Comment> comments) {
        if (comments == null || comments.isEmpty()) {
            return List.of();
        }

        return comments.stream()
                .map(this::mapCommentWithoutPost)
                .collect(Collectors.toList());
    }


}