package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.chat.domain.UserPresence;
import com.weunite.api.chat.domain.UserStatus;
import com.weunite.api.chat.repository.UserPresenceRepository;
import com.weunite.api.chat.service.UserStatusService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserStatusServiceTest {

  @Mock private UserPresenceRepository userPresenceRepository;

  @InjectMocks private UserStatusService userStatusService;

  @Test
  @DisplayName("Should persist normalized user presence")
  void updateUserStatusPersistsPresence() {
    UserPresence savedPresence = new UserPresence(7L, UserStatus.ONLINE);
    savedPresence.setUpdatedAt(LocalDateTime.now());

    when(userPresenceRepository.save(org.mockito.ArgumentMatchers.any(UserPresence.class)))
        .thenReturn(savedPresence);

    var result = userStatusService.updateUserStatus(7L, "online");

    assertEquals(7L, result.getUserId());
    assertEquals("ONLINE", result.getStatus());
    assertNotNull(result.getTimestamp());

    ArgumentCaptor<UserPresence> presenceCaptor = ArgumentCaptor.forClass(UserPresence.class);
    verify(userPresenceRepository).save(presenceCaptor.capture());
    assertEquals(UserStatus.ONLINE, presenceCaptor.getValue().getStatus());
  }

  @Test
  @DisplayName("Should fall back to offline when no shared presence exists")
  void getUserStatusReturnsOfflineWhenMissing() {
    when(userPresenceRepository.findById(7L)).thenReturn(Optional.empty());

    var result = userStatusService.getUserStatus(7L);

    assertEquals(7L, result.getUserId());
    assertEquals("OFFLINE", result.getStatus());
    assertNotNull(result.getTimestamp());
  }
}
