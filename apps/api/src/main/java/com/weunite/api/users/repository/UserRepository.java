package com.weunite.api.users.repository;

import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  Optional<User> findByVerificationToken(String verificationToken);

  boolean existsByUsernameOrEmail(String username, String email);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  @Query(
      "SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :name, '%')) AND u.emailVerified = true")
  List<User> findByNameContainingIgnoreCaseAndEmailVerifiedTrue(
      @Param("name") String name, Pageable pageable);

  @Query(
      "SELECT u FROM User u WHERE (LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND u.emailVerified = true")
  List<User> searchUsers(@Param("query") String query);

  @Query(
      "SELECT COUNT(DISTINCT p.user.id) FROM Post p WHERE COALESCE(p.updatedAt, p.createdAt) >= :since")
  Long countActiveUsersByPostActivity(@Param("since") Instant since);

  @Query("SELECT COUNT(u) FROM User u WHERE TYPE(u) = :athleteType")
  Long countByDiscriminator(@Param("athleteType") Class<? extends User> athleteType);

  default Long countAthletes() {
    return countByDiscriminator(Athlete.class);
  }

  default Long countCompanies() {
    return countByDiscriminator(Company.class);
  }
}
