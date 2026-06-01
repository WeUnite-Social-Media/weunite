package com.weunite.api.follow.service;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.domain.Follow;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.exception.FollowNotFoundException;
import com.weunite.api.follow.mapper.FollowMapper;
import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

  private final UserRepository userRepository;
  private final FollowRepository followRepository;
  private final FollowMapper followMapper;
  private final NotificationService notificationService;

  public FollowService(
      UserRepository userRepository,
      FollowRepository followRepository,
      FollowMapper followMapper,
      NotificationService notificationService) {
    this.followMapper = followMapper;
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.notificationService = notificationService;
  }

  @Transactional
  public ResponseDTO<FollowDTO> followUser(User follower, User followed) {

    Follow follow = new Follow(follower, followed);

    followRepository.save(follow);
    notificationService.createNotification(
        followed.getId(), NotificationType.NEW_FOLLOWER, follower.getId(), followed.getId(), null);

    return followMapper.toResponseDTO("Seguiu com sucesso", follow);
  }

  @Transactional
  public ResponseDTO<FollowDTO> unfollowUser(Follow follow) {
    followRepository.delete(follow);

    return followMapper.toResponseDTO("Deixou de seguir com sucesso", follow);
  }

  @Transactional
  public ResponseDTO<FollowDTO> followAndUnfollow(Long followerId, Long followedId) {
    if (followerId.equals(followedId)) {
      throw new BusinessRuleException("Nao e permitido seguir a si mesmo");
    }

    User follower = userRepository.findById(followerId).orElseThrow(UserNotFoundException::new);

    User followed = userRepository.findById(followedId).orElseThrow(UserNotFoundException::new);

    Optional<Follow> existingFollow =
        followRepository.findByFollowerIdAndFollowedId(followerId, followedId);

    if (existingFollow.isPresent()) {
      return unfollowUser(existingFollow.get());
    } else {
      return followUser(follower, followed);
    }
  }

  @Transactional(readOnly = true)
  public FollowDTO getFollow(Long followerId, Long followedId) {
    Follow follow =
        followRepository
            .findByFollowerIdAndFollowedId(followerId, followedId)
            .orElseThrow(FollowNotFoundException::new);

    return followMapper.toFollowDTO(follow);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<FollowDTO>> getFollowers(Long userId, int page, int size) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    List<Follow> follows =
        followRepository
            .findAllByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED, pageRequest(page, size))
            .getContent();

    return followMapper.toResponseDTO("Seguidores consultados com sucesso!", follows);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<List<FollowDTO>> getFollowing(Long userId, int page, int size) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    List<Follow> follows =
        followRepository
            .findAllByFollowerAndStatus(user, Follow.FollowStatus.ACCEPTED, pageRequest(page, size))
            .getContent();

    return followMapper.toResponseDTO("Seguindo consultados com sucesso!", follows);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<Long> countFollowers(Long userId) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    long count = followRepository.countByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED);

    return new ResponseDTO<>("Total de seguidores consultado com sucesso!", count);
  }

  @Transactional(readOnly = true)
  public ResponseDTO<Long> countFollowing(Long userId) {
    User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

    long count = followRepository.countByFollowerAndStatus(user, Follow.FollowStatus.ACCEPTED);

    return new ResponseDTO<>("Total de seguindo consultado com sucesso!", count);
  }

  @Transactional
  public ResponseDTO<FollowDTO> acceptFollowRequest(Long followerId, Long followedId) {
    Follow follow =
        followRepository
            .findByFollowerIdAndFollowedId(followerId, followedId)
            .orElseThrow(FollowNotFoundException::new);

    follow.accept();
    followRepository.save(follow);

    return followMapper.toResponseDTO("Solicitação de seguimento aceita com sucesso!", follow);
  }

  @Transactional
  public ResponseDTO<FollowDTO> declineFollowRequest(Long followerId, Long followedId) {
    Follow follow =
        followRepository
            .findByFollowerIdAndFollowedId(followerId, followedId)
            .orElseThrow(FollowNotFoundException::new);

    follow.decline();
    followRepository.save(follow);

    return followMapper.toResponseDTO("Solicitação de seguimento recusada com sucesso!", follow);
  }

  private Pageable pageRequest(int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
  }
}
