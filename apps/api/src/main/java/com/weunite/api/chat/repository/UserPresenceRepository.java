package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.UserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserPresenceRepository extends JpaRepository<UserPresence, Long> {

  /**
   * Sets all rows where status = 'ONLINE' to 'OFFLINE'. Used on application startup to clear
   * presence left over from the previous run.
   *
   * @return number of rows updated
   */
  @Modifying
  @Query("UPDATE UserPresence p SET p.status = 'OFFLINE', p.updatedAt = CURRENT_TIMESTAMP WHERE p.status = 'ONLINE'")
  int markAllOnlineAsOffline();
}
