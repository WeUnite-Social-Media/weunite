package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {}
