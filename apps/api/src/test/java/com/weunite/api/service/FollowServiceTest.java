package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;

import com.weunite.api.common.exception.BusinessRuleException;
import com.weunite.api.follow.mapper.FollowMapper;
import com.weunite.api.follow.repository.FollowRepository;
import com.weunite.api.follow.service.FollowService;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.users.repository.UserRepository;
import com.weunite.api.users.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private FollowRepository followRepository;
  @Mock private FollowMapper followMapper;
  @Mock private UserService userService;
  @Mock private NotificationService notificationService;

  @InjectMocks private FollowService followService;

  @Test
  @DisplayName("Should reject self follow before loading users")
  void rejectSelfFollow() {
    assertThrows(BusinessRuleException.class, () -> followService.followAndUnfollow(1L, 1L));

    verifyNoInteractions(
        userRepository, followRepository, followMapper, userService, notificationService);
  }
}
