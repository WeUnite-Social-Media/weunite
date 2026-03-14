package com.weunite.api.chat.service;

import com.weunite.api.chat.dto.UserStatusDTO;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class UserStatusService {

  private final Map<Long, UserStatusDTO> userStatusMap = new ConcurrentHashMap<>();

  public void updateUserStatus(UserStatusDTO statusUpdate) {
    userStatusMap.put(statusUpdate.getUserId(), statusUpdate);
  }

  public UserStatusDTO getUserStatus(Long userId) {
    UserStatusDTO status = userStatusMap.get(userId);

    if (status == null) {
      return new UserStatusDTO(userId, "OFFLINE", LocalDateTime.now());
    }

    return status;
  }
}
