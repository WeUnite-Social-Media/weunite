package com.example.weuniteauth.repository;

import com.example.weuniteauth.domain.chat.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c JOIN c.participants p1 JOIN c.participants p2 " +
           "WHERE p1.id = :userId1 AND p2.id = :userId2 AND SIZE(c.participants) = 2")
    Optional<Conversation> findConversationBetweenTwoUsers(@Param("userId1") Long userId1,
                                                           @Param("userId2") Long userId2);
}
