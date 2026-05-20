package com.weunite.api.chat.repository;

import com.weunite.api.chat.domain.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

  @Query(
      "SELECT DISTINCT c FROM Conversation c "
          + "JOIN c.participants p "
          + "JOIN FETCH c.participants "
          + "WHERE p.id = :userId ORDER BY c.updatedAt DESC")
  List<Conversation> findAllByUserId(@Param("userId") Long userId);

  @Query(
      "SELECT DISTINCT c FROM Conversation c "
          + "JOIN FETCH c.participants participants "
          + "JOIN c.participants p1 "
          + "JOIN c.participants p2 "
          + "WHERE p1.id = :userId1 AND p2.id = :userId2 AND SIZE(c.participants) = 2")
  Optional<Conversation> findConversationBetweenTwoUsers(
      @Param("userId1") Long userId1, @Param("userId2") Long userId2);

  @Query("SELECT c FROM Conversation c JOIN FETCH c.participants WHERE c.id = :conversationId")
  Optional<Conversation> findByIdWithParticipants(@Param("conversationId") Long conversationId);
}
