package com.example.weuniteauth.mapper;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.dto.CommentDTO;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CommentMapper {

    @Mapping(target = "id", source = "comment.id", resultType = String.class)
    @Mapping(target = "user", source = "comment.user")
    @Mapping(target = "post", source = "comment.post", qualifiedByName = "mapPostWithoutLikesFromComment")
    @Mapping(target = "text", source = "comment.text")
    @Mapping(target = "imageUrl", source = "comment.imageUrl")
    @Mapping(target = "parentComment", source = "comment.parentComment", qualifiedByName = "mapParentComment")
    @Mapping(target = "comments", source = "comment.comments", qualifiedByName = "mapCommentsToList")
    @Mapping(target = "createdAt", source = "comment.createdAt")
    @Mapping(target = "updatedAt", source = "comment.updatedAt")
    CommentDTO toCommentDTO(Comment comment);

    @Named("mapPostWithoutLikesFromComment")
    @Mapping(target = "id", source = "post.id", resultType = String.class)
    @Mapping(target = "text", source = "post.text")
    @Mapping(target = "imageUrl", source = "post.imageUrl")
    @Mapping(target = "likes", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "createdAt", source = "post.createdAt")
    @Mapping(target = "updatedAt", source = "post.updatedAt")
    @Mapping(target = "user", source = "post.user")
    PostDTO mapPostWithoutLikesFromComment(Post post);

    @Named("mapParentComment")
    @Mapping(target = "id", source = "comment.id", resultType = String.class)
    @Mapping(target = "user", source = "comment.user")
    @Mapping(target = "post", source = "comment.post", qualifiedByName = "mapPostWithoutLikesFromComment")
    @Mapping(target = "text", source = "comment.text")
    @Mapping(target = "imageUrl", source = "comment.imageUrl")
    @Mapping(target = "parentComment", ignore = true) // Avoid circular reference
    @Mapping(target = "comments", ignore = true) // Avoid circular reference
    @Mapping(target = "createdAt", source = "comment.createdAt")
    @Mapping(target = "updatedAt", source = "comment.updatedAt")
    CommentDTO mapParentComment(Comment comment);

    @Named("mapCommentsToList")
    default List<CommentDTO> mapCommentsToList(List<Comment> comments) {
        if (comments == null || comments.isEmpty()) {
            return List.of();
        }

        return comments.stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    default ResponseDTO<CommentDTO> toResponseDTO(String message, Comment comment) {
        CommentDTO commentDTO = toCommentDTO(comment);
        return new ResponseDTO<>(message, commentDTO);
    }

}
