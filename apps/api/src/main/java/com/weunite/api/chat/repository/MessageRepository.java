package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.Message;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

  List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

  @Query(
      "SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
  List<Message> findUnreadMessagesByConversationAndUser(
      @Param("conversationId") Long conversationId, @Param("userId") Long userId);

  @Query(
      "SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
  int countUnreadMessagesByConversationAndUser(
      @Param("conversationId") Long conversationId, @Param("userId") Long userId);
}
