package com.weunite.api.posts.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Like;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.LikeDTO;
import com.weunite.api.posts.exception.CommentNotFoundException;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.LikeMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.LikeRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LikeService {

  private final UserRepository userRepository;
  private final PostRepository postRepository;
  private final CommentRepository commentRepository;
  private final LikeRepository likeRepository;
  private final LikeMapper likeMapper;
  private final NotificationService notificationService;

  public LikeService(
      UserRepository userRepository,
      PostRepository postRepository,
      CommentRepository commentRepository,
      LikeRepository likeRepository,
      LikeMapper likeMapper,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.commentRepository = commentRepository;
    this.likeRepository = likeRepository;
    this.likeMapper = likeMapper;
    this.notificationService = notificationService;
  }

  @Transactional
  public ResponseDTO<LikeDTO> toggleLike(Long userId, Long postId) {

    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Post post =
        postRepository.findByIdAndDeletedFalse(postId).orElseThrow(PostNotFoundException::new);

    Like existingLike = likeRepository.findByUserAndPost(user, post).orElse(null);

    if (existingLike == null) {
      Like newLike = new Like(post, user);
      post.addLike(newLike);
      likeRepository.save(newLike);
      notificationService.createNotification(
          post.getUser().getId(), NotificationType.POST_LIKE, userId, postId, null);
      return likeMapper.toResponseDTO("Curtida criada com sucesso!", newLike);
    } else {
      post.removeLike(existingLike);
      likeRepository.delete(existingLike);
      return likeMapper.toResponseDTO("Curtida deletada com sucesso!", existingLike);
    }
  }

  @Transactional
  public ResponseDTO<LikeDTO> toggleLikeComment(Long userId, Long commentId) {

    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Comment comment =
        commentRepository
            .findByIdAndDeletedFalse(commentId)
            .orElseThrow(CommentNotFoundException::new);

    Like existingLike = likeRepository.findByUserAndComment(user, comment).orElse(null);

    if (existingLike == null) {
      Like newLike = new Like(comment, user);
      comment.addLike(newLike);
      likeRepository.save(newLike);
      notificationService.createNotification(
          comment.getUser().getId(), NotificationType.COMMENT_LIKE, userId, commentId, null);
      return likeMapper.toResponseDTO("Curtida criada com sucesso!", newLike);
    } else {
      comment.removeLike(existingLike);
      likeRepository.delete(existingLike);
      return likeMapper.toResponseDTO("Curtida deletada com sucesso!", existingLike);
    }
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<LikeDTO>> getLikes(Long userId) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Set<Like> likes = likeRepository.findByUser(user);

    return likeMapper.toResponseDTO("Likes consultados com sucesso!", likes);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<LikeDTO>> getLikes(Long userId, int pagina, int items) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Pageable pageable = PageRequest.of(pagina, items);

    Page<Like> likes = likeRepository.findByUser(user, pageable);

    return likeMapper.toResponseDTO("Likes consultados com sucesso!", likes.getContent());
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<LikeDTO>> getCommentLikes(Long commentId) {
    Comment comment =
        commentRepository
            .findByIdAndDeletedFalse(commentId)
            .orElseThrow(CommentNotFoundException::new);

    Set<Like> likes = likeRepository.findByComment(comment);

    return likeMapper.toResponseDTO("Curtidas do comentário consultadas com sucesso!", likes);
  }
}
