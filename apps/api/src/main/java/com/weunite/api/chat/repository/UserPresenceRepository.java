package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.UserPresence;
import com.weunite.api.chat.domain.UserStatus;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {

  @Modifying
  @Query(
      "UPDATE UserPresence p SET p.status = :offlineStatus, p.updatedAt = :now "
          + "WHERE p.status = :onlineStatus AND p.updatedAt < :staleBefore")
  int markStaleOnlineUsersOffline(
      @Param("onlineStatus") UserStatus onlineStatus,
      @Param("offlineStatus") UserStatus offlineStatus,
      @Param("staleBefore") LocalDateTime staleBefore,
      @Param("now") LocalDateTime now);

  @Modifying
  @Query(
      "UPDATE UserPresence p SET p.status = :offlineStatus, p.updatedAt = :now "
          + "WHERE p.status = :onlineStatus")
  int markOnlineUsersOffline(
      @Param("onlineStatus") UserStatus onlineStatus,
      @Param("offlineStatus") UserStatus offlineStatus,
      @Param("now") LocalDateTime now);
}
