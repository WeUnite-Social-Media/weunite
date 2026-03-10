package com.example.weuniteauth.service;

import com.example.weuniteauth.dto.chat.UserStatusDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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