package com.example.weuniteauth.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDTO {
    private Long userId;
    private String status;
    private LocalDateTime timestamp;
}