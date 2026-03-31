package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

  @EntityGraph(attributePaths = {"user"})
  List<Post> findAllWithUserByIdIn(List<Long> ids);

  Long countByUserIdAndDeletedFalse(Long userId);

  @Query(
      value =
          """
          SELECT
            feed.post_id AS postId,
            feed.repost_id AS repostId,
            feed.entry_type AS entryType
          FROM (
            SELECT
              p.id AS post_id,
              CAST(NULL AS BIGINT) AS repost_id,
              COALESCE(p.updated_at, p.created_at) AS feed_timestamp,
              'POST' AS entry_type
            FROM post p
            WHERE p.deleted = false

            UNION ALL

            SELECT
              r.post_id AS post_id,
              r.id AS repost_id,
              r.created_at AS feed_timestamp,
              'REPOST' AS entry_type
            FROM tb_post_repost r
            JOIN post p ON p.id = r.post_id
            WHERE p.deleted = false
          ) feed
          ORDER BY feed.feed_timestamp DESC, feed.post_id DESC, COALESCE(feed.repost_id, 0) DESC
          """,
      countQuery =
          """
          SELECT COUNT(*)
          FROM (
            SELECT p.id
            FROM post p
            WHERE p.deleted = false

            UNION ALL

            SELECT r.id
            FROM tb_post_repost r
            JOIN post p ON p.id = r.post_id
            WHERE p.deleted = false
          ) feed
          """,
      nativeQuery = true)
  Page<FeedItemProjection> findFeedEntries(Pageable pageable);

  @Query(
      value =
          """
          SELECT
            feed.post_id AS postId,
            feed.repost_id AS repostId,
            feed.entry_type AS entryType
          FROM (
            SELECT
              p.id AS post_id,
              CAST(NULL AS BIGINT) AS repost_id,
              COALESCE(p.updated_at, p.created_at) AS feed_timestamp,
              'POST' AS entry_type
            FROM post p
            WHERE p.deleted = false
              AND p.user_id = :userId

            UNION ALL

            SELECT
              r.post_id AS post_id,
              r.id AS repost_id,
              r.created_at AS feed_timestamp,
              'REPOST' AS entry_type
            FROM tb_post_repost r
            JOIN post p ON p.id = r.post_id
            WHERE p.deleted = false
              AND r.user_id = :userId
          ) feed
          ORDER BY feed.feed_timestamp DESC, feed.post_id DESC, COALESCE(feed.repost_id, 0) DESC
          """,
      countQuery =
          """
          SELECT COUNT(*)
          FROM (
            SELECT p.id
            FROM post p
            WHERE p.deleted = false
              AND p.user_id = :userId

            UNION ALL

            SELECT r.id
            FROM tb_post_repost r
            JOIN post p ON p.id = r.post_id
            WHERE p.deleted = false
              AND r.user_id = :userId
          ) feed
          """,
      nativeQuery = true)
  Page<FeedItemProjection> findFeedEntriesByUserId(@Param("userId") Long userId, Pageable pageable);

  @Query("SELECT COUNT(l) FROM Like l WHERE l.post IS NOT NULL")
  Long countTotalLikes();

  @Query("SELECT COUNT(c) FROM Comment c")
  Long countTotalComments();

  @Query(
      "SELECT COUNT(l) FROM Like l WHERE l.post IS NOT NULL AND l.createdAt BETWEEN :startDate AND :endDate")
  Long countLikesBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

  @Query("SELECT COUNT(c) FROM Comment c WHERE c.createdAt BETWEEN :startDate AND :endDate")
  Long countCommentsBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

  @Query("SELECT COUNT(p) FROM Post p WHERE p.createdAt BETWEEN :startDate AND :endDate")
  Long countPostsBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
