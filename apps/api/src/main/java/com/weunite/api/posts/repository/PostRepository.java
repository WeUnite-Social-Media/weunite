package com.weunite.api.posts.repository;

import com.weunite.api.posts.domain.Post;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

  @EntityGraph(attributePaths = {"user"})
  List<Post> findAllWithUserByIdInAndDeletedFalse(List<Long> ids);

  boolean existsByIdAndUserId(Long postId, Long userId);

  Optional<Post> findByIdAndDeletedFalse(Long postId);

  boolean existsByIdAndDeletedFalse(Long postId);

  Long countByUserIdAndDeletedFalse(Long userId);

  @Query(
      "SELECT p.user.id, COUNT(p) FROM Post p "
          + "WHERE p.deleted = false AND p.user.id IN :userIds "
          + "GROUP BY p.user.id")
  List<Object[]> countActivePostsByUserIds(@Param("userIds") List<Long> userIds);

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

  @Query(
      value =
          """
          SELECT
            feed.post_id AS postId,
            p.text AS text,
            p.image_url AS imageUrl,
            p.created_at AS createdAt,
            p.updated_at AS updatedAt,
            u.id AS userId,
            u.name AS userName,
            u.username AS username,
            u.profile_img AS userProfileImg,
            COUNT(DISTINCT l.id) AS likesCount,
            COUNT(DISTINCT c.id) AS commentsCount,
            CASE
              WHEN :viewerId IS NOT NULL AND EXISTS (
                SELECT 1
                FROM tb_post_like viewer_like
                WHERE viewer_like.post_id = p.id
                  AND viewer_like.user_id = :viewerId
              )
              THEN TRUE
              ELSE FALSE
            END AS likedByViewer,
            ru.id AS repostedByUserId,
            ru.name AS repostedByName,
            ru.username AS repostedByUsername,
            ru.profile_img AS repostedByProfileImg,
            r.created_at AS repostedAt
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
          JOIN post p ON p.id = feed.post_id
          JOIN tb_user u ON u.id = p.user_id
          LEFT JOIN tb_post_repost r ON r.id = feed.repost_id
          LEFT JOIN tb_user ru ON ru.id = r.user_id
          LEFT JOIN tb_post_like l ON l.post_id = p.id
          LEFT JOIN comment c ON c.post_id = p.id AND c.deleted = false
          GROUP BY
            feed.post_id,
            feed.repost_id,
            feed.feed_timestamp,
            p.id,
            p.text,
            p.image_url,
            p.created_at,
            p.updated_at,
            u.id,
            u.name,
            u.username,
            u.profile_img,
            ru.id,
            ru.name,
            ru.username,
            ru.profile_img,
            r.created_at
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
  Page<FeedPostSummaryProjection> findFeedSummaries(
      @Param("viewerId") Long viewerId, Pageable pageable);

  @Query(
      value =
          """
          SELECT
            feed.post_id AS postId,
            p.text AS text,
            p.image_url AS imageUrl,
            p.created_at AS createdAt,
            p.updated_at AS updatedAt,
            u.id AS userId,
            u.name AS userName,
            u.username AS username,
            u.profile_img AS userProfileImg,
            COUNT(DISTINCT l.id) AS likesCount,
            COUNT(DISTINCT c.id) AS commentsCount,
            CASE
              WHEN :viewerId IS NOT NULL AND EXISTS (
                SELECT 1
                FROM tb_post_like viewer_like
                WHERE viewer_like.post_id = p.id
                  AND viewer_like.user_id = :viewerId
              )
              THEN TRUE
              ELSE FALSE
            END AS likedByViewer,
            ru.id AS repostedByUserId,
            ru.name AS repostedByName,
            ru.username AS repostedByUsername,
            ru.profile_img AS repostedByProfileImg,
            r.created_at AS repostedAt
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
          JOIN post p ON p.id = feed.post_id
          JOIN tb_user u ON u.id = p.user_id
          LEFT JOIN tb_post_repost r ON r.id = feed.repost_id
          LEFT JOIN tb_user ru ON ru.id = r.user_id
          LEFT JOIN tb_post_like l ON l.post_id = p.id
          LEFT JOIN comment c ON c.post_id = p.id AND c.deleted = false
          GROUP BY
            feed.post_id,
            feed.repost_id,
            feed.feed_timestamp,
            p.id,
            p.text,
            p.image_url,
            p.created_at,
            p.updated_at,
            u.id,
            u.name,
            u.username,
            u.profile_img,
            ru.id,
            ru.name,
            ru.username,
            ru.profile_img,
            r.created_at
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
  Page<FeedPostSummaryProjection> findFeedSummariesByUserId(
      @Param("viewerId") Long viewerId, @Param("userId") Long userId, Pageable pageable);

  @Query("SELECT COUNT(l) FROM Like l WHERE l.post IS NOT NULL")
  Long countTotalLikes();

  @Query("SELECT COUNT(c) FROM Comment c")
  Long countTotalComments();

  @Query(
      "SELECT COUNT(l) FROM Like l WHERE l.post IS NOT NULL AND l.createdAt >= :startDate AND l.createdAt < :endDate")
  Long countLikesBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

  @Query(
      "SELECT COUNT(c) FROM Comment c WHERE c.createdAt >= :startDate AND c.createdAt < :endDate")
  Long countCommentsBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

  @Query("SELECT COUNT(p) FROM Post p WHERE p.createdAt >= :startDate AND p.createdAt < :endDate")
  Long countPostsBetweenDates(
      @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
