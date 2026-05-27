package com.weunite.api.posts.service;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.posts.domain.Comment;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.dto.CommentDTO;
import com.weunite.api.posts.dto.CommentRequestDTO;
import com.weunite.api.posts.exception.CommentNotFoundException;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.CommentMapper;
import com.weunite.api.posts.repository.CommentRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CommentService {

  private final UserRepository userRepository;
  private final CommentRepository commentRepository;
  private final PostRepository postRepository;
  private final CommentMapper commentMapper;
  private final NotificationService notificationService;

  public CommentService(
      UserRepository userRepository,
      CommentRepository commentRepository,
      PostRepository postRepository,
      CommentMapper commentMapper,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
    this.commentMapper = commentMapper;
    this.notificationService = notificationService;
  }

  @Transactional
  public ResponseDTO<CommentDTO> createComment(
      Long userId, Long postId, CommentRequestDTO comment) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Post post =
        postRepository.findByIdAndDeletedFalse(postId).orElseThrow(PostNotFoundException::new);

    Comment newComment = new Comment(user, post, comment.text(), comment.image());

    commentRepository.save(newComment);
    notificationService.createNotification(
        post.getUser().getId(), NotificationType.POST_COMMENT, userId, postId, null);

    return commentMapper.toResponseDTO("Comentário criado com sucesso!", newComment);
  }

  @Transactional
  public List<CommentDTO> getCommentsByPost(Long postId) {
    if (!postRepository.existsByIdAndDeletedFalse(postId)) {
      throw new PostNotFoundException();
    }

    List<Comment> comments = commentRepository.findByPostId(postId);
    return commentMapper.mapCommentsToList(comments);
  }

  @Transactional
  public List<CommentDTO> getCommentsByUser(Long userId) {
    if (!userRepository.existsById(userId)) {
      throw new UserNotFoundException();
    }
    List<Comment> comments = commentRepository.findByUserId(userId);
    return commentMapper.mapCommentsToList(comments);
  }

  @Transactional
  public ResponseDTO<CommentDTO> updateComment(
      Long userId, Long commentId, CommentRequestDTO updatedComment, MultipartFile image) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    Comment existingComment =
        commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);

    if (!userId.equals(existingComment.getUser().getId())) {
      throw new UnauthorizedException("Você precisa estar logado para atualizar este comentário");
    }

    existingComment.setText(updatedComment.text());

    commentRepository.save(existingComment);

    return commentMapper.toResponseDTO("Comentário atualizado com sucesso!", existingComment);
  }

  @Transactional
  public ResponseDTO<CommentDTO> deleteComment(Long userId, Long commentId) {
    Comment comment =
        commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);

    if (!userId.equals(comment.getUser().getId())) {
      throw new UnauthorizedException("Você precisa estar logado para deletar esse comentário!");
    }

    commentRepository.delete(comment);

    return commentMapper.toResponseDTO("Comentário excluído com sucesso", comment);
  }
}
