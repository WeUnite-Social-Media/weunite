package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

  @Query(
      "SELECT m FROM Message m JOIN FETCH m.sender "
          + "WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
  List<Message> findByConversationIdWithSenderOrderByCreatedAtAsc(
      @Param("conversationId") Long conversationId);

  @Query(
      "SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
  List<Message> findUnreadMessagesByConversationAndUser(
      @Param("conversationId") Long conversationId, @Param("userId") Long userId);

  @Query(
      "SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.isRead = false")
  int countUnreadMessagesByConversationAndUser(
      @Param("conversationId") Long conversationId, @Param("userId") Long userId);

  @Query("SELECT m FROM Message m JOIN FETCH m.sender WHERE m.id = :messageId")
  Optional<Message> findByIdWithSender(@Param("messageId") Long messageId);

  @Query(
      "SELECT DISTINCT m FROM Message m "
          + "JOIN FETCH m.sender "
          + "JOIN m.conversation c "
          + "JOIN c.participants p "
          + "WHERE p.id = :userId "
          + "AND m.deleted = false "
          + "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) "
          + "ORDER BY m.createdAt DESC")
  List<Message> searchMessagesByContentForUser(
      @Param("userId") Long userId, @Param("query") String query, Pageable pageable);
}
