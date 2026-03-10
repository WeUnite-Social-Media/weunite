package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.post.Comment;
import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.CommentDTO;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.UserDTO;
import com.example.weuniteauth.dto.comment.CommentRequestDTO;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.comment.CommentNotFoundException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.CommentMapper;
import com.example.weuniteauth.repository.CommentRepository;
import com.example.weuniteauth.repository.PostRepository;
import com.example.weuniteauth.repository.user.UserRepository;
import com.example.weuniteauth.service.cloudinary.CloudinaryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CommentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentMapper commentMapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CommentService commentService;

    // CREATE COMMENT TESTS

    @Test
    @DisplayName("Should create comment successfully when user and post exist")
    void createCommentSuccess() {
        Long userId = 1L;
        Long postId = 1L;
        CommentRequestDTO commentRequest = new CommentRequestDTO("This is a test comment", null);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Post mockPost = new Post();
        mockPost.setId(postId);
        mockPost.setText("Test post");

        Comment createdComment = new Comment(mockUser, mockPost, commentRequest.text(), commentRequest.image());
        createdComment.setId(1L);
        createdComment.setCreatedAt(Instant.now());

        UserDTO userDTO = new UserDTO(
                "1",
                "Test User",
                "testuser",
                "basic",
                "Bio",
                "test@example.com",
                null,
                null,
                false,
                Instant.now(),
                null
        );

        PostDTO postDTO = new PostDTO(
                "1",
                "Test post",
                null,
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                null,
                userDTO
        );

        CommentDTO commentDTO = new CommentDTO(
                "1",
                userDTO,
                postDTO,
                "This is a test comment",
                null,
                null,
                new ArrayList<>(),
                Instant.now(),
                null
        );

        ResponseDTO<CommentDTO> expectedResponse = new ResponseDTO<>("Comentário criado com sucesso!", commentDTO);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(postRepository.findById(postId)).thenReturn(Optional.of(mockPost));
        when(commentRepository.save(any(Comment.class))).thenReturn(createdComment);
        when(commentMapper.toResponseDTO(eq("Comentário criado com sucesso!"), any(Comment.class)))
                .thenReturn(expectedResponse);

        ResponseDTO<CommentDTO> result = commentService.createComment(userId, postId, commentRequest);

        assertNotNull(result);
        assertEquals("Comentário criado com sucesso!", result.message());
        assertNotNull(result.data());
        assertEquals("This is a test comment", result.data().text());

        verify(userRepository).findById(userId);
        verify(postRepository).findById(postId);
        verify(commentRepository).save(any(Comment.class));
        verify(commentMapper).toResponseDTO(eq("Comentário criado com sucesso!"), any(Comment.class));
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist during comment creation")
    void createCommentWithNonExistentUser() {
        Long userId = 999L;
        Long postId = 1L;
        CommentRequestDTO commentRequest = new CommentRequestDTO("This is a test comment", null);

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () ->
            commentService.createComment(userId, postId, commentRequest)
        );

        assertNotNull(exception);
        verify(userRepository).findById(userId);
        verifyNoInteractions(postRepository, commentRepository, commentMapper);
    }

    @Test
    @DisplayName("Should throw PostNotFoundException when post does not exist during comment creation")
    void createCommentWithNonExistentPost() {
        Long userId = 1L;
        Long postId = 999L;
        CommentRequestDTO commentRequest = new CommentRequestDTO("This is a test comment", null);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        PostNotFoundException exception = assertThrows(PostNotFoundException.class, () ->
            commentService.createComment(userId, postId, commentRequest)
        );

        assertNotNull(exception);
        verify(userRepository).findById(userId);
        verify(postRepository).findById(postId);
        verifyNoInteractions(commentRepository, commentMapper);
    }

    // UPDATE COMMENT TESTS

    @Test
    @DisplayName("Should update comment successfully when user is owner")
    void updateCommentSuccess() {
        Long userId = 1L;
        Long commentId = 1L;
        CommentRequestDTO updatedCommentRequest = new CommentRequestDTO("Updated comment text", null);
        MultipartFile image = mock(MultipartFile.class);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Comment existingComment = new Comment();
        existingComment.setId(commentId);
        existingComment.setUser(mockUser);
        existingComment.setText("Original comment text");

        UserDTO userDTO = new UserDTO(
                "1",
                "Test User",
                "testuser",
                "basic",
                "Bio",
                "test@example.com",
                null,
                null,
                false,
                Instant.now(),
                null
        );

        CommentDTO updatedCommentDTO = new CommentDTO(
                "1",
                userDTO,
                null,
                "Updated comment text",
                null,
                null,
                new ArrayList<>(),
                Instant.now(),
                Instant.now()
        );

        ResponseDTO<CommentDTO> expectedResponse = new ResponseDTO<>(
                "Comentário atualizado com sucesso!",
                updatedCommentDTO
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));
        when(commentRepository.save(existingComment)).thenReturn(existingComment);
        when(commentMapper.toResponseDTO(eq("Comentário atualizado com sucesso!"), eq(existingComment)))
                .thenReturn(expectedResponse);

        ResponseDTO<CommentDTO> result = commentService.updateComment(userId, commentId, updatedCommentRequest, image);

        assertNotNull(result);
        assertEquals("Comentário atualizado com sucesso!", result.message());
        assertNotNull(result.data());

        verify(userRepository).findById(userId);
        verify(commentRepository).findById(commentId);
        verify(commentRepository).save(existingComment);
        verify(commentMapper).toResponseDTO(eq("Comentário atualizado com sucesso!"), eq(existingComment));
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist during update")
    void updateCommentWithNonExistentUser() {
        Long userId = 999L;
        Long commentId = 1L;
        CommentRequestDTO updatedCommentRequest = new CommentRequestDTO("Updated comment text", null);

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () ->
            commentService.updateComment(userId, commentId, updatedCommentRequest, null)
        );

        assertNotNull(exception);
        verify(userRepository).findById(userId);
        verifyNoInteractions(commentRepository, commentMapper);
    }

    @Test
    @DisplayName("Should throw CommentNotFoundException when comment does not exist during update")
    void updateCommentWithNonExistentComment() {
        Long userId = 1L;
        Long commentId = 999L;
        CommentRequestDTO updatedCommentRequest = new CommentRequestDTO("Updated comment text", null);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class, () ->
            commentService.updateComment(userId, commentId, updatedCommentRequest, null)
        );

        assertNotNull(exception);
        verify(userRepository).findById(userId);
        verify(commentRepository).findById(commentId);
        verifyNoInteractions(commentMapper);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user is not the owner during update")
    void updateCommentWithUnauthorizedUser() {
        Long userId = 1L;
        Long ownerId = 2L;
        Long commentId = 1L;
        CommentRequestDTO updatedCommentRequest = new CommentRequestDTO("Updated comment text", null);

        User currentUser = new User();
        currentUser.setId(userId);
        currentUser.setUsername("currentuser");

        User commentOwner = new User();
        commentOwner.setId(ownerId);
        commentOwner.setUsername("owner");

        Comment existingComment = new Comment();
        existingComment.setId(commentId);
        existingComment.setUser(commentOwner);

        when(userRepository.findById(userId)).thenReturn(Optional.of(currentUser));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
            commentService.updateComment(userId, commentId, updatedCommentRequest, null)
        );

        assertEquals("Você precisa estar logado para atualizar este comentário", exception.getMessage());
        verify(userRepository).findById(userId);
        verify(commentRepository).findById(commentId);
        verify(commentRepository, never()).save(any());
        verifyNoInteractions(commentMapper);
    }

    // DELETE COMMENT TESTS

    @Test
    @DisplayName("Should delete comment successfully when user is owner")
    void deleteCommentSuccess() {
        Long userId = 1L;
        Long commentId = 1L;

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Comment existingComment = new Comment();
        existingComment.setId(commentId);
        existingComment.setUser(mockUser);
        existingComment.setText("Comment to be deleted");

        UserDTO userDTO = new UserDTO(
                "1",
                "Test User",
                "testuser",
                "basic",
                "Bio",
                "test@example.com",
                null,
                null,
                false,
                Instant.now(),
                null
        );

        CommentDTO deletedCommentDTO = new CommentDTO(
                "1",
                userDTO,
                null,
                "Comment to be deleted",
                null,
                null,
                new ArrayList<>(),
                Instant.now(),
                null
        );

        ResponseDTO<CommentDTO> expectedResponse = new ResponseDTO<>(
                "Comentário excluída com sucesso",
                deletedCommentDTO
        );

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));
        when(commentMapper.toResponseDTO(eq("Comentário excluída com sucesso"), eq(existingComment)))
                .thenReturn(expectedResponse);

        ResponseDTO<CommentDTO> result = commentService.deleteComment(userId, commentId);

        assertNotNull(result);
        assertEquals("Comentário excluída com sucesso", result.message());
        assertNotNull(result.data());

        verify(commentRepository).findById(commentId);
        verify(commentRepository).delete(existingComment);
        verify(commentMapper).toResponseDTO(eq("Comentário excluída com sucesso"), eq(existingComment));
    }

    @Test
    @DisplayName("Should throw CommentNotFoundException when comment does not exist during deletion")
    void deleteCommentWithNonExistentComment() {
        Long userId = 1L;
        Long commentId = 999L;

        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class, () ->
            commentService.deleteComment(userId, commentId)
        );

        assertNotNull(exception);
        verify(commentRepository).findById(commentId);
        verify(commentRepository, never()).delete(any());
        verifyNoInteractions(commentMapper);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user is not the owner during deletion")
    void deleteCommentWithUnauthorizedUser() {
        Long userId = 1L;
        Long ownerId = 2L;
        Long commentId = 1L;

        User commentOwner = new User();
        commentOwner.setId(ownerId);
        commentOwner.setUsername("owner");

        Comment existingComment = new Comment();
        existingComment.setId(commentId);
        existingComment.setUser(commentOwner);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(existingComment));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
            commentService.deleteComment(userId, commentId)
        );

        assertEquals("Você precisa estar logado para deletar esse comentário!", exception.getMessage());
        verify(commentRepository).findById(commentId);
        verify(commentRepository, never()).delete(any());
        verifyNoInteractions(commentMapper);
    }

    // GET COMMENTS TESTS

    @Test
    @DisplayName("Should get comments by post successfully when post exists")
    void getCommentsByPostSuccess() {
        Long postId = 1L;
        List<Comment> mockComments = new ArrayList<>();
        List<CommentDTO> expectedCommentDTOs = new ArrayList<>();

        when(postRepository.existsById(postId)).thenReturn(true);
        when(commentRepository.findByPostId(postId)).thenReturn(mockComments);
        when(commentMapper.mapCommentsToList(mockComments)).thenReturn(expectedCommentDTOs);

        List<CommentDTO> result = commentService.getCommentsByPost(postId);

        assertNotNull(result);
        assertEquals(expectedCommentDTOs, result);

        verify(postRepository).existsById(postId);
        verify(commentRepository).findByPostId(postId);
        verify(commentMapper).mapCommentsToList(mockComments);
    }

    @Test
    @DisplayName("Should throw CommentNotFoundException when post does not exist")
    void getCommentsByPostWithNonExistentPost() {
        Long postId = 999L;

        when(postRepository.existsById(postId)).thenReturn(false);

        CommentNotFoundException exception = assertThrows(CommentNotFoundException.class, () ->
            commentService.getCommentsByPost(postId)
        );

        assertNotNull(exception);
        verify(postRepository).existsById(postId);
        verifyNoInteractions(commentRepository, commentMapper);
    }

    @Test
    @DisplayName("Should get comments by user successfully when user exists")
    void getCommentsByUserSuccess() {
        Long userId = 1L;
        List<Comment> mockComments = new ArrayList<>();
        List<CommentDTO> expectedCommentDTOs = new ArrayList<>();

        when(userRepository.existsById(userId)).thenReturn(true);
        when(commentRepository.findByUserId(userId)).thenReturn(mockComments);
        when(commentMapper.mapCommentsToList(mockComments)).thenReturn(expectedCommentDTOs);

        List<CommentDTO> result = commentService.getCommentsByUser(userId);

        assertNotNull(result);
        assertEquals(expectedCommentDTOs, result);

        verify(userRepository).existsById(userId);
        verify(commentRepository).findByUserId(userId);
        verify(commentMapper).mapCommentsToList(mockComments);
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist during get comments")
    void getCommentsByUserWithNonExistentUser() {
        Long userId = 999L;

        when(userRepository.existsById(userId)).thenReturn(false);

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () ->
            commentService.getCommentsByUser(userId)
        );

        assertNotNull(exception);
        verify(userRepository).existsById(userId);
        verifyNoInteractions(commentRepository, commentMapper);
    }
}
