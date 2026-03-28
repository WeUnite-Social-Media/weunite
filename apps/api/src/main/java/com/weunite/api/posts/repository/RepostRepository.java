package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.users.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RepostRepository extends JpaRepository<Repost, Long> {

  Optional<Repost> findByUserAndPost(User user, Post post);

  @Query(
      "SELECT r FROM Repost r "
          + "JOIN FETCH r.user "
          + "JOIN FETCH r.post p "
          + "JOIN FETCH p.user "
          + "WHERE r.id IN :ids")
  List<Repost> findAllByIdWithFeedContext(@Param("ids") List<Long> ids);
}
