package com.weunite.api.posts.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.posts.dto.RepostDTO;
import com.weunite.api.posts.exception.PostNotFoundException;
import com.weunite.api.posts.mapper.RepostMapper;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.posts.repository.RepostRepository;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RepostService {

  private final UserRepository userRepository;
  private final PostRepository postRepository;
  private final RepostRepository repostRepository;
  private final RepostMapper repostMapper;
  private final NotificationService notificationService;

  public RepostService(
      UserRepository userRepository,
      PostRepository postRepository,
      RepostRepository repostRepository,
      RepostMapper repostMapper,
      NotificationService notificationService) {
    this.userRepository = userRepository;
    this.postRepository = postRepository;
    this.repostRepository = repostRepository;
    this.repostMapper = repostMapper;
    this.notificationService = notificationService;
  }

  @Transactional
  public ResponseDTO<RepostDTO> toggleRepost(Long userId, Long postId) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
    Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);

    Repost existingRepost = repostRepository.findByUserAndPost(user, post).orElse(null);

    if (existingRepost == null) {
      Repost newRepost = new Repost(post, user);
      post.addRepost(newRepost);
      repostRepository.save(newRepost);
      notificationService.createNotification(
          post.getUser().getId(), NotificationType.POST_REPOST, userId, postId, null);
      return repostMapper.toResponseDTO("Post republicado com sucesso!", newRepost);
    }

    post.removeRepost(existingRepost);
    repostRepository.delete(existingRepost);
    return repostMapper.toResponseDTO("Repost removido com sucesso!", existingRepost);
  }
}
