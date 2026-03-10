package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.post.Post;
import com.example.weuniteauth.domain.users.User;
import com.example.weuniteauth.dto.PostDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.dto.UserDTO;
import com.example.weuniteauth.dto.post.PostRequestDTO;
import com.example.weuniteauth.exceptions.UnauthorizedException;
import com.example.weuniteauth.exceptions.post.PostNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.PostMapper;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostMapper postMapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private PostService postService;

    // CREATE POST TESTS

    @Test
    @DisplayName("Should create a post with image successfully")
    void createPostWithImageSuccessfully() {
        Long userId = 1L;
        PostRequestDTO postRequest = new PostRequestDTO("This is a test post");
        MultipartFile image = mock(MultipartFile.class);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Post createdPost = new Post(mockUser, postRequest.text(), "http://image.url/test.jpg");
        createdPost.setId(1L);
        createdPost.setCreatedAt(Instant.now());

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
                "This is a test post",
                "http://image.url/test.jpg",
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                null,
                userDTO
        );

        ResponseDTO<PostDTO> expectedResponse = new ResponseDTO<>("Publicação criada com sucesso!", postDTO);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(image.isEmpty()).thenReturn(false);
        when(cloudinaryService.uploadPost(image, userId)).thenReturn("http://image.url/test.jpg");
        when(postRepository.save(any(Post.class))).thenReturn(createdPost);
        when(postMapper.toResponseDTO(eq("Publicação criada com sucesso!"), any(Post.class)))
                .thenReturn(expectedResponse);

        ResponseDTO<PostDTO> result = postService.createPost(userId, postRequest, image);

        assertNotNull(result);
        assertEquals("Publicação criada com sucesso!", result.message());
        assertNotNull(result.data());
        assertEquals("This is a test post", result.data().text());
        assertEquals("http://image.url/test.jpg", result.data().imageUrl());

        verify(userRepository).findById(userId);
        verify(image).isEmpty();
        verify(cloudinaryService).uploadPost(image, userId);
        verify(postRepository).save(any(Post.class));
        verify(postMapper).toResponseDTO(eq("Publicação criada com sucesso!"), any(Post.class));
    }

    @Test
    @DisplayName("Should create a post without image successfully")
    void createPostWithoutImageSuccessfully() {
        Long userId = 1L;
        PostRequestDTO postRequest = new PostRequestDTO("This is a test post without image");

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Post createdPost = new Post(mockUser, postRequest.text(), null);
        createdPost.setId(1L);
        createdPost.setCreatedAt(Instant.now());

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
                "This is a test post without image",
                null,
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                null,
                userDTO
        );

        ResponseDTO<PostDTO> expectedResponse = new ResponseDTO<>("Publicação criada com sucesso!", postDTO);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(postRepository.save(any(Post.class))).thenReturn(createdPost);
        when(postMapper.toResponseDTO(eq("Publicação criada com sucesso!"), any(Post.class)))
                .thenReturn(expectedResponse);

        ResponseDTO<PostDTO> result = postService.createPost(userId, postRequest, null);

        assertNotNull(result);
        assertEquals("Publicação criada com sucesso!", result.message());
        assertNotNull(result.data());
        assertEquals("This is a test post without image", result.data().text());
        assertNull(result.data().imageUrl());

        verify(userRepository).findById(userId);
        verify(postRepository).save(any(Post.class));
        verify(postMapper).toResponseDTO(eq("Publicação criada com sucesso!"), any(Post.class));
        verifyNoInteractions(cloudinaryService);
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user does not exist during post creation")
    void createPostWithNonExistentUser() {
        Long userId = 999L;
        PostRequestDTO postRequest = new PostRequestDTO("This is a test post");

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        UserNotFoundException exception = assertThrows(UserNotFoundException.class, () ->
            postService.createPost(userId, postRequest, null)
        );

        assertNotNull(exception);
        verify(userRepository).findById(userId);
        verifyNoInteractions(postRepository, postMapper, cloudinaryService);
    }

    // UPDATE POST TESTS

    @Test
    @DisplayName("Should update post successfully when user is owner and data is valid")
    void updatePostSuccess() {
        Long userId = 1L;
        Long postId = 1L;
        PostRequestDTO updatedPostRequest = new PostRequestDTO("Updated post text");
        MultipartFile image = mock(MultipartFile.class);

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Post existingPost = new Post();
        existingPost.setId(postId);
        existingPost.setUser(mockUser);
        existingPost.setText("Original post text");
        existingPost.setImageUrl("http://old-image.url");

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

        PostDTO updatedPostDTO = new PostDTO(
                "1",
                "Updated post text",
                "http://new-image.url",
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                Instant.now(),
                userDTO
        );

        ResponseDTO<PostDTO> expectedResponse = new ResponseDTO<>(
                "Publicação atualizada com sucesso!",
                updatedPostDTO
        );

        when(postRepository.findById(postId)).thenReturn(Optional.of(existingPost));
        when(image.isEmpty()).thenReturn(false);
        when(cloudinaryService.uploadPost(image, userId)).thenReturn("http://new-image.url");
        when(postRepository.save(existingPost)).thenReturn(existingPost);
        when(postMapper.toResponseDTO(eq("Publicação atualizada com sucesso!"), eq(existingPost)))
                .thenReturn(expectedResponse);

        ResponseDTO<PostDTO> result = postService.updatePost(userId, postId, updatedPostRequest, image);

        assertNotNull(result);
        assertEquals("Publicação atualizada com sucesso!", result.message());
        assertNotNull(result.data());

        verify(postRepository).findById(postId);
        verify(image).isEmpty();
        verify(cloudinaryService).uploadPost(image, userId);
        verify(postRepository).save(existingPost);
        verify(postMapper).toResponseDTO(eq("Publicação atualizada com sucesso!"), eq(existingPost));
    }

    @Test
    @DisplayName("Should throw PostNotFoundException when post does not exist during update")
    void updatePostWithNonExistentPost() {
        Long userId = 1L;
        Long postId = 999L;
        PostRequestDTO updatedPostRequest = new PostRequestDTO("Updated post text");

        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        PostNotFoundException exception = assertThrows(PostNotFoundException.class, () ->
            postService.updatePost(userId, postId, updatedPostRequest, null)
        );

        assertNotNull(exception);
        verify(postRepository).findById(postId);
        verifyNoInteractions(postMapper, cloudinaryService);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user is not the owner during update")
    void updatePostWithUnauthorizedUser() {
        Long userId = 1L;
        Long ownerId = 2L;
        Long postId = 1L;
        PostRequestDTO updatedPostRequest = new PostRequestDTO("Updated post text");

        User postOwner = new User();
        postOwner.setId(ownerId);
        postOwner.setUsername("owner");

        Post existingPost = new Post();
        existingPost.setId(postId);
        existingPost.setUser(postOwner);

        when(postRepository.findById(postId)).thenReturn(Optional.of(existingPost));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
            postService.updatePost(userId, postId, updatedPostRequest, null)
        );

        assertEquals("Você precisa estar logado para atualizar esta publicação", exception.getMessage());
        verify(postRepository).findById(postId);
        verifyNoInteractions(postMapper, cloudinaryService);
    }

    // DELETE POST TESTS

    @Test
    @DisplayName("Should delete post successfully when user is owner")
    void deletePostSuccess() {
        Long userId = 1L;
        Long postId = 1L;

        User mockUser = new User();
        mockUser.setId(userId);
        mockUser.setUsername("testuser");

        Post existingPost = new Post();
        existingPost.setId(postId);
        existingPost.setUser(mockUser);
        existingPost.setText("Post to be deleted");

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

        PostDTO deletedPostDTO = new PostDTO(
                "1",
                "Post to be deleted",
                null,
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                null,
                userDTO
        );

        ResponseDTO<PostDTO> expectedResponse = new ResponseDTO<>(
                "Publicação excluída com sucesso",
                deletedPostDTO
        );

        when(postRepository.findById(postId)).thenReturn(Optional.of(existingPost));
        when(postMapper.toResponseDTO(eq("Publicação excluída com sucesso"), eq(existingPost)))
                .thenReturn(expectedResponse);

        ResponseDTO<PostDTO> result = postService.deletePost(userId, postId);

        assertNotNull(result);
        assertEquals("Publicação excluída com sucesso", result.message());
        assertNotNull(result.data());

        verify(postRepository).findById(postId);
        verify(postRepository).delete(existingPost);
        verify(postMapper).toResponseDTO(eq("Publicação excluída com sucesso"), eq(existingPost));
    }

    @Test
    @DisplayName("Should throw PostNotFoundException when post does not exist during deletion")
    void deletePostWithNonExistentPost() {
        Long userId = 1L;
        Long postId = 999L;

        when(postRepository.findById(postId)).thenReturn(Optional.empty());

        PostNotFoundException exception = assertThrows(PostNotFoundException.class, () ->
            postService.deletePost(userId, postId)
        );

        assertNotNull(exception);
        verify(postRepository).findById(postId);
        verify(postRepository, never()).delete(any());
        verifyNoInteractions(postMapper);
    }

    @Test
    @DisplayName("Should throw UnauthorizedException when user is not the owner during deletion")
    void deletePostWithUnauthorizedUser() {
        Long userId = 1L;
        Long ownerId = 2L;
        Long postId = 1L;

        User postOwner = new User();
        postOwner.setId(ownerId);
        postOwner.setUsername("owner");

        Post existingPost = new Post();
        existingPost.setId(postId);
        existingPost.setUser(postOwner);

        when(postRepository.findById(postId)).thenReturn(Optional.of(existingPost));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () ->
            postService.deletePost(userId, postId)
        );

        assertEquals("Você precisa estar logado para deletar essa publicação!", exception.getMessage());
        verify(postRepository).findById(postId);
        verify(postRepository, never()).delete(any());
        verifyNoInteractions(postMapper);
    }
}
