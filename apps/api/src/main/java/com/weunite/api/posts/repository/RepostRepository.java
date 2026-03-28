package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import com.weunite.api.posts.domain.Repost;
import com.weunite.api.users.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepostRepository extends JpaRepository<Repost, Long> {

  Optional<Repost> findByUserAndPost(User user, Post post);

  @EntityGraph(attributePaths = {"user", "post", "post.user"})
  List<Repost> findAllWithFeedContextByIdIn(List<Long> ids);
}
