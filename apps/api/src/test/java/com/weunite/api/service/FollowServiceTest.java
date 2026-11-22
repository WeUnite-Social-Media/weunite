package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.domain.Follow;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.dto.MutualFollowersDTO;
import com.weunite.api.follow.exception.FollowNotFoundException;
import com.weunite.api.follow.mapper.FollowMapper;
import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.follow.service.FollowService;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.mapper.UserMapper;
import com.weunite.api.users.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private FollowRepository followRepository;
  @Mock private FollowMapper followMapper;
  @Mock private NotificationService notificationService;
  @Mock private UserMapper userMapper;

  @InjectMocks private FollowService followService;

  @Test
  @DisplayName("Should reject self follow before loading users")
  void rejectSelfFollow() {
    assertThrows(BusinessRuleException.class, () -> followService.followAndUnfollow(1L, 1L));

    verifyNoInteractions(userRepository, followRepository, followMapper, notificationService);
  }

  @Test
  @DisplayName("Should return an existing follow relationship")
  void getFollowReturnsExistingRelationship() {
    User follower = new User();
    follower.setId(1L);
    User followed = new User();
    followed.setId(2L);
    Follow follow = new Follow(follower, followed);
    follow.setId(10L);
    FollowDTO expected = new FollowDTO(10L, null, null, "ACCEPTED", null, null);

    when(followRepository.findByFollowerIdAndFollowedId(1L, 2L)).thenReturn(Optional.of(follow));
    when(followMapper.toFollowDTO(follow)).thenReturn(expected);

    FollowDTO result = followService.getFollow(1L, 2L);

    assertEquals(expected, result);
    verify(followRepository).findByFollowerIdAndFollowedId(1L, 2L);
    verify(followMapper).toFollowDTO(follow);
  }

  @Test
  @DisplayName("Should throw when follow relationship does not exist")
  void getFollowThrowsWhenRelationshipDoesNotExist() {
    when(followRepository.findByFollowerIdAndFollowedId(1L, 2L)).thenReturn(Optional.empty());

    assertThrows(FollowNotFoundException.class, () -> followService.getFollow(1L, 2L));

    verify(followRepository).findByFollowerIdAndFollowedId(1L, 2L);
    verifyNoInteractions(followMapper);
  }

  @Test
  @DisplayName("Should paginate followers and clamp unsafe page size")
  void getFollowersPaginatesAndClampsSize() {
    User user = new User();
    user.setId(2L);
    Follow follow = new Follow(new User(), user);
    List<Follow> follows = List.of(follow);
    ResponseDTO<List<FollowDTO>> expected =
        new ResponseDTO<>("Seguidores consultados com sucesso!", List.of());

    when(userRepository.findById(2L)).thenReturn(Optional.of(user));
    when(followRepository.findAllByFollowedAndStatus(
            user,
            Follow.FollowStatus.ACCEPTED,
            PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "id"))))
        .thenReturn(new PageImpl<>(follows));
    when(followMapper.toResponseDTO("Seguidores consultados com sucesso!", follows))
        .thenReturn(expected);

    ResponseDTO<List<FollowDTO>> result = followService.getFollowers(2L, -1, 500);

    assertEquals(expected, result);
    verify(followRepository)
        .findAllByFollowedAndStatus(
            user,
            Follow.FollowStatus.ACCEPTED,
            PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "id")));
  }

  @Test
  @DisplayName("Should count accepted followers")
  void countFollowersReturnsAcceptedTotal() {
    User user = new User();
    user.setId(2L);

    when(userRepository.findById(2L)).thenReturn(Optional.of(user));
    when(followRepository.countByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED))
        .thenReturn(3L);

    ResponseDTO<Long> result = followService.countFollowers(2L);

    assertEquals(3L, result.data());
    verify(followRepository).countByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED);
  }

  private User userWithId(Long id) {
    User user = new User();
    user.setId(id);
    return user;
  }

  private UserDTO dtoFor(User user) {
    return new UserDTO(
        String.valueOf(user.getId()),
        "n",
        "u" + user.getId(),
        null,
        null,
        null,
        null,
        null,
        false,
        null,
        null);
  }

  @Test
  @DisplayName("Should return only followers of the target that the viewer also follows")
  void getMutualFollowersReturnsIntersection() {
    // viewer (1) segue 10 e 20. Seguidores do alvo (5): 20, 30, 10 (ordem do repositorio)
    when(userRepository.existsById(5L)).thenReturn(true);
    when(followRepository.findFollowedIdsByFollowerId(1L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(10L, 20L));
    when(followRepository.findFollowerIdsByFollowedId(5L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(20L, 30L, 10L));
    User u20 = userWithId(20L);
    User u10 = userWithId(10L);
    when(userRepository.findAllById(List.of(20L, 10L))).thenReturn(List.of(u10, u20));
    when(userMapper.toUserDTO(u20)).thenReturn(dtoFor(u20));
    when(userMapper.toUserDTO(u10)).thenReturn(dtoFor(u10));

    ResponseDTO<MutualFollowersDTO> result = followService.getMutualFollowers(1L, 5L, 3);

    assertEquals(2, result.data().total());
    assertEquals(List.of("20", "10"), result.data().users().stream().map(UserDTO::id).toList());
  }

  @Test
  @DisplayName("Should count all mutual followers but only load the requested sample")
  void getMutualFollowersLimitsSampleButKeepsTotal() {
    when(userRepository.existsById(5L)).thenReturn(true);
    when(followRepository.findFollowedIdsByFollowerId(1L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(10L, 20L, 30L));
    when(followRepository.findFollowerIdsByFollowedId(5L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(30L, 20L, 10L));
    User u30 = userWithId(30L);
    when(userRepository.findAllById(List.of(30L))).thenReturn(List.of(u30));
    when(userMapper.toUserDTO(u30)).thenReturn(dtoFor(u30));

    ResponseDTO<MutualFollowersDTO> result = followService.getMutualFollowers(1L, 5L, 1);

    assertEquals(3, result.data().total());
    assertEquals(1, result.data().users().size());
  }

  @Test
  @DisplayName("Should return empty result when there are no mutual followers")
  void getMutualFollowersReturnsEmptyWhenNoIntersection() {
    when(userRepository.existsById(5L)).thenReturn(true);
    when(followRepository.findFollowedIdsByFollowerId(1L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(10L));
    when(followRepository.findFollowerIdsByFollowedId(5L, Follow.FollowStatus.ACCEPTED))
        .thenReturn(List.of(30L));

    ResponseDTO<MutualFollowersDTO> result = followService.getMutualFollowers(1L, 5L, 3);

    assertEquals(0, result.data().total());
    assertEquals(List.of(), result.data().users());
    verify(userRepository, never()).findAllById(any());
  }

  @Test
  @DisplayName("Should return empty result when viewing own profile")
  void getMutualFollowersReturnsEmptyForOwnProfile() {
    when(userRepository.existsById(1L)).thenReturn(true);

    ResponseDTO<MutualFollowersDTO> result = followService.getMutualFollowers(1L, 1L, 3);

    assertEquals(0, result.data().total());
    verifyNoInteractions(followRepository);
  }

  @Test
  @DisplayName("Should throw when the target user does not exist")
  void getMutualFollowersThrowsWhenTargetDoesNotExist() {
    when(userRepository.existsById(99L)).thenReturn(false);

    assertThrows(UserNotFoundException.class, () -> followService.getMutualFollowers(1L, 99L, 3));
  }
}
