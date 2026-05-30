package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.storage.service.CloudinaryService;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.dto.PostRequestDTO;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.FeedItemProjection;
import com.weunite.api.posts.repository.LikeRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.repository.RepostRepository;
import com.weunite.api.posts.service.PostService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
public class PostServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private PostRepository postRepository;

  @Mock private LikeRepository likeRepository;

  @Mock private RepostRepository repostRepository;

  @Mock private PostMapper postMapper;

  @Mock private CloudinaryService cloudinaryService;

  @InjectMocks private PostService postService;

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

    UserDTO userDTO =
        new UserDTO(
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
            null);

    PostDTO postDTO =
        new PostDTO(
            "1",
            "This is a test post",
            "http://image.url/test.jpg",
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            Instant.now(),
            null,
            userDTO,
            null,
            null);

    ResponseDTO<PostDTO> expectedResponse =
        new ResponseDTO<>("Publicação criada com sucesso!", postDTO);

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

    UserDTO userDTO =
        new UserDTO(
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
            null);

    PostDTO postDTO =
        new PostDTO(
            "1",
            "This is a test post without image",
            null,
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            Instant.now(),
            null,
            userDTO,
            null,
            null);

    ResponseDTO<PostDTO> expectedResponse =
        new ResponseDTO<>("Publicação criada com sucesso!", postDTO);

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

    UserNotFoundException exception =
        assertThrows(
            UserNotFoundException.class, () -> postService.createPost(userId, postRequest, null));

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

    UserDTO userDTO =
        new UserDTO(
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
            null);

    PostDTO updatedPostDTO =
        new PostDTO(
            "1",
            "Updated post text",
            "http://new-image.url",
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            Instant.now(),
            Instant.now(),
            userDTO,
            null,
            null);

    ResponseDTO<PostDTO> expectedResponse =
        new ResponseDTO<>("Publicação atualizada com sucesso!", updatedPostDTO);

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(existingPost));
    when(image.isEmpty()).thenReturn(false);
    when(cloudinaryService.uploadPost(image, userId)).thenReturn("http://new-image.url");
    when(postRepository.save(existingPost)).thenReturn(existingPost);
    when(postMapper.toResponseDTO(eq("Publicação atualizada com sucesso!"), eq(existingPost)))
        .thenReturn(expectedResponse);

    ResponseDTO<PostDTO> result = postService.updatePost(userId, postId, updatedPostRequest, image);

    assertNotNull(result);
    assertEquals("Publicação atualizada com sucesso!", result.message());
    assertNotNull(result.data());

    verify(postRepository).findByIdAndDeletedFalse(postId);
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

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.empty());

    PostNotFoundException exception =
        assertThrows(
            PostNotFoundException.class,
            () -> postService.updatePost(userId, postId, updatedPostRequest, null));

    assertNotNull(exception);
    verify(postRepository).findByIdAndDeletedFalse(postId);
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

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(existingPost));

    UnauthorizedException exception =
        assertThrows(
            UnauthorizedException.class,
            () -> postService.updatePost(userId, postId, updatedPostRequest, null));

    assertEquals(
        "Você precisa estar logado para atualizar esta publicação", exception.getMessage());
    verify(postRepository).findByIdAndDeletedFalse(postId);
    verifyNoInteractions(postMapper, cloudinaryService);
  }

  // DELETE POST TESTS

  @Test
  @DisplayName("Should soft delete post successfully when user is owner")
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

    UserDTO userDTO =
        new UserDTO(
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
            null);

    PostDTO deletedPostDTO =
        new PostDTO(
            "1",
            "Post to be deleted",
            null,
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            Instant.now(),
            null,
            userDTO,
            null,
            null);

    ResponseDTO<PostDTO> expectedResponse =
        new ResponseDTO<>("Publicação excluída com sucesso", deletedPostDTO);

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(existingPost));
    when(postMapper.toResponseDTO(eq("Publicação excluída com sucesso"), eq(existingPost)))
        .thenReturn(expectedResponse);

    ResponseDTO<PostDTO> result = postService.deletePost(userId, postId);

    assertNotNull(result);
    assertEquals("Publicação excluída com sucesso", result.message());
    assertNotNull(result.data());

    assertTrue(existingPost.isDeleted());
    verify(postRepository).findByIdAndDeletedFalse(postId);
    verify(postRepository, never()).save(any());
    verifyNoInteractions(likeRepository, repostRepository);
    verify(postMapper).toResponseDTO(eq("Publicação excluída com sucesso"), eq(existingPost));
  }

  @Test
  @DisplayName("Should throw PostNotFoundException when post does not exist during deletion")
  void deletePostWithNonExistentPost() {
    Long userId = 1L;
    Long postId = 999L;

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.empty());

    PostNotFoundException exception =
        assertThrows(PostNotFoundException.class, () -> postService.deletePost(userId, postId));

    assertNotNull(exception);
    verify(postRepository).findByIdAndDeletedFalse(postId);
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

    when(postRepository.findByIdAndDeletedFalse(postId)).thenReturn(Optional.of(existingPost));

    UnauthorizedException exception =
        assertThrows(UnauthorizedException.class, () -> postService.deletePost(userId, postId));

    assertEquals("Você precisa estar logado para deletar essa publicação!", exception.getMessage());
    verify(postRepository).findByIdAndDeletedFalse(postId);
    verify(postRepository, never()).delete(any());
    verifyNoInteractions(postMapper);
  }

  @Test
  @DisplayName("Should merge posts and reposts ordered by newest feed timestamp")
  void getPostsMergesPostsAndReposts() {
    User author = new User();
    author.setId(1L);
    author.setUsername("author");

    User reposter = new User();
    reposter.setId(2L);
    reposter.setUsername("reposter");

    Post post = new Post();
    post.setId(1L);
    post.setUser(author);
    post.setCreatedAt(Instant.parse("2026-03-24T10:00:00Z"));

    Repost repost = new Repost();
    repost.setId(5L);
    repost.setPost(post);
    repost.setUser(reposter);
    repost.setCreatedAt(Instant.parse("2026-03-24T12:00:00Z"));

    PostDTO originalPostDTO =
        new PostDTO(
            "1",
            "Original post",
            null,
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            post.getCreatedAt(),
            null,
            null,
            null,
            null);

    PostDTO repostedPostDTO =
        new PostDTO(
            "1",
            "Original post",
            null,
            new ArrayList<>(),
            new ArrayList<>(),
            new ArrayList<>(),
            post.getCreatedAt(),
            null,
            null,
            null,
            repost.getCreatedAt());

    when(postRepository.findFeedEntries(any()))
        .thenReturn(
            new PageImpl<>(
                List.of(
                    feedEntry("REPOST", post.getId(), repost.getId()),
                    feedEntry("POST", post.getId(), null))));
    when(postRepository.findAllWithUserByIdInAndDeletedFalse(List.of(post.getId())))
        .thenReturn(List.of(post));
    when(repostRepository.findAllByIdWithFeedContext(List.of(repost.getId())))
        .thenReturn(List.of(repost));
    when(postMapper.toPostDTO(post)).thenReturn(originalPostDTO);
    when(postMapper.toPostDTOFromRepost(repost)).thenReturn(repostedPostDTO);

    List<PostDTO> result = postService.getPosts(0, 10);

    assertEquals(List.of(repostedPostDTO, originalPostDTO), result);
    verify(postRepository).findFeedEntries(any());
    verify(postRepository).findAllWithUserByIdInAndDeletedFalse(List.of(post.getId()));
    verify(repostRepository).findAllByIdWithFeedContext(List.of(repost.getId()));
    verify(postMapper).toPostDTO(post);
    verify(postMapper).toPostDTOFromRepost(repost);
  }

  private FeedItemProjection feedEntry(String entryType, Long postId, Long repostId) {
    return new FeedItemProjection() {
      @Override
      public Long getPostId() {
        return postId;
      }

      @Override
      public Long getRepostId() {
        return repostId;
      }

      @Override
      public String getEntryType() {
        return entryType;
      }
    };
  }
}
