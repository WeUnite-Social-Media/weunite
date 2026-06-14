package com.weunite.api.posts.service;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.common.storage.service.CloudinaryService;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.FeedPostSummaryDTO;
import com.weunite.api.posts.dto.PostDTO;
import com.weunite.api.posts.dto.PostRequestDTO;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.PostMapper;
import com.weunite.api.posts.repository.FeedPostSummaryProjection;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.UserSummaryDTO;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PostService {

  private final UserRepository userRepository;
  private final PostRepository postRepository;
  private final PostMapper postMapper;
  private final CloudinaryService cloudinaryService;

  public PostService(
      UserRepository userRepository,
      PostRepository postRepository,
      PostMapper postMapper,
      CloudinaryService cloudinaryService) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.postMapper = postMapper;
    this.cloudinaryService = cloudinaryService;
  }

  @Transactional
  public ResponseDTO<PostDTO> createPost(Long userId, PostRequestDTO post, MultipartFile image) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    String imageUrl = null;

    if (image != null && !image.isEmpty()) {
      imageUrl = cloudinaryService.uploadPost(image, userId);
    }

    Post createdPost = new Post(user, post.text(), imageUrl);

    postRepository.save(createdPost);

    return postMapper.toResponseDTO("Publicação criada com sucesso!", createdPost);
  }

  @Transactional
  public ResponseDTO<PostDTO> updatePost(
      Long userId, Long postId, PostRequestDTO updatedPost, MultipartFile image) {
    Post existingPost =
        postRepository.findByIdAndDeletedFalse(postId).orElseThrow(PostNotFoundException::new);

    if (!userId.equals(existingPost.getUser().getId())) {
      throw new UnauthorizedException("Você precisa estar logado para atualizar esta publicação");
    }

    String imageUrl = existingPost.getImageUrl();

    if (image != null && !image.isEmpty()) {
      imageUrl = cloudinaryService.uploadPost(image, userId);
    }

    existingPost.setText(updatedPost.text());
    existingPost.setImageUrl(imageUrl);
    postRepository.save(existingPost);

    return postMapper.toResponseDTO("Publicação atualizada com sucesso!", existingPost);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<PostDTO> getPost(Long postId) {
    Post post =
        postRepository.findByIdAndDeletedFalse(postId).orElseThrow(PostNotFoundException::new);

    return postMapper.toResponseDTO("Publicação consultada com sucesso!", post);
  }

  @Transactional(readOnly = true)
  public List<FeedPostSummaryDTO> getPosts(Long viewerId, int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    PageRequest pageable = PageRequest.of(safePage, safeSize);

    return postRepository.findFeedSummaries(viewerId, pageable).getContent().stream()
        .map(this::toFeedPostSummaryDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<FeedPostSummaryDTO> getPostsByUser(Long viewerId, Long userId, int page, int size) {
    if (!userRepository.existsById(userId)) {
      throw new UserNotFoundException();
    }

    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    PageRequest pageable = PageRequest.of(safePage, safeSize);

    return postRepository
        .findFeedSummariesByUserId(viewerId, userId, pageable)
        .getContent()
        .stream()
        .map(this::toFeedPostSummaryDTO)
        .toList();
  }

  @Transactional
  public ResponseDTO<PostDTO> deletePost(Long userId, Long postId) {
    Post post =
        postRepository.findByIdAndDeletedFalse(postId).orElseThrow(PostNotFoundException::new);

    if (!userId.equals(post.getUser().getId())) {
      throw new UnauthorizedException("Você precisa estar logado para deletar essa publicação!");
    }

    post.setDeleted(true);

    return postMapper.toResponseDTO("Publicação excluída com sucesso", post);
  }

  private FeedPostSummaryDTO toFeedPostSummaryDTO(FeedPostSummaryProjection projection) {
    return new FeedPostSummaryDTO(
        String.valueOf(projection.getPostId()),
        projection.getText(),
        projection.getImageUrl(),
        valueOrZero(projection.getLikesCount()),
        valueOrZero(projection.getCommentsCount()),
        Boolean.TRUE.equals(projection.getLikedByViewer()),
        projection.getCreatedAt(),
        projection.getUpdatedAt(),
        new UserSummaryDTO(
            String.valueOf(projection.getUserId()),
            projection.getUserName(),
            projection.getUsername(),
            projection.getUserProfileImg()),
        toRepostedBySummary(projection),
        projection.getRepostedAt());
  }

  private UserSummaryDTO toRepostedBySummary(FeedPostSummaryProjection projection) {
    if (projection.getRepostedByUserId() == null) {
      return null;
    }

    return new UserSummaryDTO(
        String.valueOf(projection.getRepostedByUserId()),
        projection.getRepostedByName(),
        projection.getRepostedByUsername(),
        projection.getRepostedByProfileImg());
  }

  private long valueOrZero(Long value) {
    return value != null ? value : 0;
  }
}
