package com.weunite.api.admin.stats.service;

import com.weunite.api.admin.stats.dto.AdminStatsDTO;
import com.weunite.api.admin.stats.dto.DashboardActivityDTO;
import com.weunite.api.admin.stats.dto.DashboardDataDTO;
import com.weunite.api.admin.stats.dto.MonthlyDataDTO;
import com.weunite.api.admin.stats.dto.OpportunityByCategoryDTO;
import com.weunite.api.admin.stats.dto.OpportunityCategoryWithSkillsDTO;
import com.weunite.api.admin.stats.dto.PreviousMonthStatsDTO;
import com.weunite.api.admin.stats.dto.UserTypeDataDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Skill;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servico responsavel por calcular estatisticas do dashboard admin. Lida com metricas gerais, dados
 * mensais e distribuicao de usuarios.
 */
@Service
public class AdminStatsService {

  private static final int DEFAULT_DASHBOARD_MONTHS = 6;
  private static final int MAX_DASHBOARD_MONTHS = 12;
  private static final int TOP_SKILL_LIMIT = 5;
  private static final int RELATED_SKILL_LIMIT = 3;

  private final PostRepository postRepository;
  private final OpportunityRepository opportunityRepository;
  private final UserRepository userRepository;

  public AdminStatsService(
      PostRepository postRepository,
      OpportunityRepository opportunityRepository,
      UserRepository userRepository) {
    this.postRepository = postRepository;
    this.opportunityRepository = opportunityRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public DashboardDataDTO getDashboardData(int months) {
    return new DashboardDataDTO(
        getAdminStats(), getDashboardActivity(months), getOpportunitiesByCategory());
  }

  /** Calcula estatisticas gerais do dashboard */
  @Transactional(readOnly = true)
  public AdminStatsDTO getAdminStats() {
    Instant now = Instant.now();
    Instant tenDaysAgo = now.minus(10, ChronoUnit.DAYS);

    LocalDate today = LocalDate.now();
    LocalDate startOfMonth = today.withDayOfMonth(1);
    LocalDate startOfPreviousMonth = startOfMonth.minusMonths(1);
    LocalDate endOfPreviousMonth = startOfMonth.minusDays(1);

    Instant startOfLastMonth =
        startOfPreviousMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
    Instant endOfLastMonth =
        endOfPreviousMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

    Long totalPosts = postRepository.count();
    Long totalOpportunities = opportunityRepository.count();
    Long activeUsers = userRepository.countActiveUsersByPostActivity(tenDaysAgo);

    Long totalLikes = postRepository.countTotalLikes();
    Long totalComments = postRepository.countTotalComments();
    Double engagementRate =
        calculateEngagementRate(totalPosts, totalLikes, totalComments, activeUsers);

    Long previousMonthPosts =
        postRepository.countPostsBetweenDates(startOfLastMonth, endOfLastMonth);
    Long previousMonthOpportunities =
        opportunityRepository.countOpportunitiesBetweenDates(startOfLastMonth, endOfLastMonth);

    Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
    Long previousActiveUsers = userRepository.countActiveUsersByPostActivity(thirtyDaysAgo);
    Double previousEngagementRate = engagementRate * 0.95;

    PreviousMonthStatsDTO previousMonth =
        new PreviousMonthStatsDTO(
            previousMonthPosts,
            previousMonthOpportunities,
            previousActiveUsers,
            previousEngagementRate);

    return new AdminStatsDTO(
        totalPosts, totalOpportunities, activeUsers, engagementRate, previousMonth);
  }

  /**
   * Calcula a taxa de engajamento. Formula: ((Likes + Comentarios) / (Posts * Usuarios ativos)) *
   * 100
   */
  private Double calculateEngagementRate(
      Long totalPosts, Long totalLikes, Long totalComments, Long activeUsers) {
    if (totalPosts == null || totalPosts == 0 || activeUsers == null || activeUsers == 0) {
      return 0.0;
    }

    long safeLikes = totalLikes != null ? totalLikes : 0L;
    long safeComments = totalComments != null ? totalComments : 0L;
    long totalInteractions = safeLikes + safeComments;

    double potentialInteractions = totalPosts.doubleValue() * activeUsers.doubleValue();
    if (potentialInteractions == 0.0) {
      return 0.0;
    }

    return (totalInteractions / potentialInteractions) * 100;
  }

  /** Retorna dados mensais dos ultimos 6 meses */
  @Transactional(readOnly = true)
  public List<MonthlyDataDTO> getMonthlyData() {
    return buildMonthlySnapshots(DEFAULT_DASHBOARD_MONTHS).stream()
        .map(
            snapshot ->
                new MonthlyDataDTO(snapshot.month(), snapshot.posts(), snapshot.opportunities()))
        .collect(Collectors.toList());
  }

  /** Retorna atividade mensal do dashboard com posts, oportunidades e novos usuarios */
  @Transactional(readOnly = true)
  public List<DashboardActivityDTO> getDashboardActivity(int months) {
    return buildMonthlySnapshots(months).stream()
        .map(
            snapshot ->
                new DashboardActivityDTO(
                    snapshot.month(), snapshot.posts(), snapshot.opportunities(), snapshot.users()))
        .collect(Collectors.toList());
  }

  /** Retorna distribuicao de usuarios por tipo */
  @Transactional(readOnly = true)
  public List<UserTypeDataDTO> getUserTypeData() {
    Long athletesCount = userRepository.countAthletes();
    Long companiesCount = userRepository.countCompanies();

    List<UserTypeDataDTO> userTypeData = new ArrayList<>();
    userTypeData.add(new UserTypeDataDTO("Atletas", athletesCount));
    userTypeData.add(new UserTypeDataDTO("Empresas", companiesCount));

    return userTypeData;
  }

  /**
   * Retorna top skills mais frequentes baseado no numero de oportunidades que as usam, incluindo as
   * skills que mais aparecem em conjunto com cada uma delas.
   */
  @Transactional(readOnly = true)
  public List<OpportunityCategoryWithSkillsDTO> getOpportunitiesWithSkills() {
    return buildOpportunitySkillInsights().stream()
        .limit(TOP_SKILL_LIMIT)
        .map(
            insight ->
                new OpportunityCategoryWithSkillsDTO(
                    insight.name(), insight.count(), insight.topRelatedSkills()))
        .collect(Collectors.toList());
  }

  /** Retorna distribuicao de categorias baseada nas principais skills das oportunidades */
  @Transactional(readOnly = true)
  public List<OpportunityByCategoryDTO> getOpportunitiesByCategory() {
    List<OpportunitySkillInsight> skillInsights = buildOpportunitySkillInsights();
    if (skillInsights.isEmpty()) {
      return List.of();
    }

    long totalSkillMentions =
        skillInsights.stream().mapToLong(OpportunitySkillInsight::count).sum();

    return skillInsights.stream()
        .limit(TOP_SKILL_LIMIT)
        .map(
            insight ->
                new OpportunityByCategoryDTO(
                    insight.name(),
                    insight.count(),
                    calculatePercentage(insight.count(), totalSkillMentions)))
        .collect(Collectors.toList());
  }

  private List<MonthlySnapshot> buildMonthlySnapshots(int months) {
    int safeMonths = sanitizeMonths(months);
    LocalDate today = LocalDate.now();
    List<MonthlySnapshot> monthlySnapshots = new ArrayList<>();

    for (int i = safeMonths - 1; i >= 0; i--) {
      LocalDate targetMonth = today.minusMonths(i);
      LocalDate startOfMonth = targetMonth.withDayOfMonth(1);
      LocalDate endOfMonth = targetMonth.withDayOfMonth(targetMonth.lengthOfMonth());

      Instant startInstant = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
      Instant endInstant = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

      monthlySnapshots.add(
          new MonthlySnapshot(
              formatMonthLabel(targetMonth),
              safeCount(postRepository.countPostsBetweenDates(startInstant, endInstant)),
              safeCount(
                  opportunityRepository.countOpportunitiesBetweenDates(startInstant, endInstant)),
              safeCount(userRepository.countUsersCreatedBetweenDates(startInstant, endInstant))));
    }

    return monthlySnapshots;
  }

  private List<OpportunitySkillInsight> buildOpportunitySkillInsights() {
    List<Opportunity> allOpportunities = opportunityRepository.findAll();
    if (allOpportunities == null || allOpportunities.isEmpty()) {
      return List.of();
    }

    Map<String, Long> skillCountMap = new HashMap<>();
    Map<String, Map<String, Long>> relatedSkillCountMap = new HashMap<>();

    for (Opportunity opportunity : allOpportunities) {
      Set<String> uniqueSkillNames = extractUniqueSkillNames(opportunity);
      if (uniqueSkillNames.isEmpty()) {
        continue;
      }

      for (String skillName : uniqueSkillNames) {
        skillCountMap.put(skillName, skillCountMap.getOrDefault(skillName, 0L) + 1);
      }

      for (String skillName : uniqueSkillNames) {
        Map<String, Long> relatedSkillCounts =
            relatedSkillCountMap.computeIfAbsent(skillName, ignored -> new HashMap<>());
        for (String relatedSkillName : uniqueSkillNames) {
          if (!skillName.equals(relatedSkillName)) {
            relatedSkillCounts.put(
                relatedSkillName, relatedSkillCounts.getOrDefault(relatedSkillName, 0L) + 1);
          }
        }
      }
    }

    Comparator<Map.Entry<String, Long>> byCountDescThenName =
        Comparator.<Map.Entry<String, Long>, Long>comparing(
                Map.Entry::getValue, Comparator.reverseOrder())
            .thenComparing(Map.Entry::getKey);

    return skillCountMap.entrySet().stream()
        .sorted(byCountDescThenName)
        .map(
            entry ->
                new OpportunitySkillInsight(
                    entry.getKey(),
                    entry.getValue(),
                    getTopRelatedSkills(relatedSkillCountMap.get(entry.getKey()))))
        .collect(Collectors.toList());
  }

  private Set<String> extractUniqueSkillNames(Opportunity opportunity) {
    if (opportunity.getSkills() == null || opportunity.getSkills().isEmpty()) {
      return Set.of();
    }

    return opportunity.getSkills().stream()
        .map(Skill::getName)
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(name -> !name.isEmpty())
        .collect(Collectors.toCollection(HashSet::new));
  }

  private List<String> getTopRelatedSkills(Map<String, Long> relatedSkillCounts) {
    if (relatedSkillCounts == null || relatedSkillCounts.isEmpty()) {
      return List.of();
    }

    Comparator<Map.Entry<String, Long>> byCountDescThenName =
        Comparator.<Map.Entry<String, Long>, Long>comparing(
                Map.Entry::getValue, Comparator.reverseOrder())
            .thenComparing(Map.Entry::getKey);

    return relatedSkillCounts.entrySet().stream()
        .sorted(byCountDescThenName)
        .limit(RELATED_SKILL_LIMIT)
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());
  }

  private int sanitizeMonths(int months) {
    return Math.max(1, Math.min(months, MAX_DASHBOARD_MONTHS));
  }

  private String formatMonthLabel(LocalDate targetMonth) {
    String monthName =
        targetMonth
            .getMonth()
            .getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
            .substring(0, 3);

    return monthName.substring(0, 1).toUpperCase() + monthName.substring(1);
  }

  private Double calculatePercentage(Long value, long total) {
    if (value == null || total == 0L) {
      return 0.0;
    }

    return Math.round((value * 1000.0) / total) / 10.0;
  }

  private Long safeCount(Long value) {
    return value != null ? value : 0L;
  }

  private record MonthlySnapshot(String month, Long posts, Long opportunities, Long users) {}

  private record OpportunitySkillInsight(String name, Long count, List<String> topRelatedSkills) {}
}
