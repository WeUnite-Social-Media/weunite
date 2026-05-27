package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.follow.domain.Follow;
import com.weunite.api.follow.dto.FollowDTO;
import com.weunite.api.follow.exception.FollowNotFoundException;
import com.weunite.api.follow.mapper.FollowMapper;
import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.follow.service.FollowService;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.domain.User;
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

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private FollowRepository followRepository;
  @Mock private FollowMapper followMapper;
  @Mock private NotificationService notificationService;

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
            user, Follow.FollowStatus.ACCEPTED, PageRequest.of(0, 100)))
        .thenReturn(new PageImpl<>(follows));
    when(followMapper.toResponseDTO("Seguidores consultados com sucesso!", follows))
        .thenReturn(expected);

    ResponseDTO<List<FollowDTO>> result = followService.getFollowers(2L, -1, 500);

    assertEquals(expected, result);
    verify(followRepository)
        .findAllByFollowedAndStatus(user, Follow.FollowStatus.ACCEPTED, PageRequest.of(0, 100));
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
}
