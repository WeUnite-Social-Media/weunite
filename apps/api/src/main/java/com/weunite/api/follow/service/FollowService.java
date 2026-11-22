package com.weunite.api.follow.service;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.domain.Follow;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.dto.MutualFollowersDTO;
import com.weunite.api.follow.exception.FollowNotFoundException;
import com.weunite.api.follow.mapper.FollowMapper;
import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.mapper.UserMapper;
import com.weunite.api.users.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
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
  private final UserMapper userMapper;

  public FollowService(
      UserRepository userRepository,
      FollowRepository followRepository,
      FollowMapper followMapper,
      NotificationService notificationService,
      UserMapper userMapper) {
    this.followMapper = followMapper;
    this.userRepository = userRepository;
    this.followRepository = followRepository;
    this.notificationService = notificationService;
    this.userMapper = userMapper;
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

  @Transactional(readOnly = true)
  public ResponseDTO<MutualFollowersDTO> getMutualFollowers(Long viewerId, Long targetId, int sample) {
    String message = "Seguidores em comum consultados com sucesso!";

    if (!userRepository.existsById(targetId)) {
      throw new UserNotFoundException();
    }

    if (viewerId.equals(targetId)) {
      return new ResponseDTO<>(message, new MutualFollowersDTO(0, List.of()));
    }

    Set<Long> viewerFollowingIds =
        new HashSet<>(
            followRepository.findFollowedIdsByFollowerId(viewerId, Follow.FollowStatus.ACCEPTED));

    List<Long> mutualIds =
        followRepository
            .findFollowerIdsByFollowedId(targetId, Follow.FollowStatus.ACCEPTED)
            .stream()
            .filter(viewerFollowingIds::contains)
            .toList();

    int safeSample = Math.min(Math.max(sample, 0), 10);
    List<Long> sampleIds = mutualIds.stream().limit(safeSample).toList();

    Map<Long, User> usersById =
        sampleIds.isEmpty()
            ? Map.of()
            : userRepository.findAllById(sampleIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

    List<UserDTO> users =
        sampleIds.stream()
            .map(usersById::get)
            .filter(Objects::nonNull)
            .map(userMapper::toUserDTO)
            .toList();

    return new ResponseDTO<>(message, new MutualFollowersDTO(mutualIds.size(), users));
  }

  private Pageable pageRequest(int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
  }
}
