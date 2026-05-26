package com.weunite.api.notifications.repository;

import com.weunite.api.notifications.domain.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

  List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

  Optional<Notification> findByIdAndUserId(Long notificationId, Long userId);

  Long countByUserIdAndIsReadFalse(Long userId);

  @Modifying
  @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
  void markAllAsReadByUserId(@Param("userId") Long userId);
}
