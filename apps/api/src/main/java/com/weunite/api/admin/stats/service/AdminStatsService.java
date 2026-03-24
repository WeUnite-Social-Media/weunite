package com.weunite.api.admin.stats.service;

import com.weunite.api.admin.stats.dto.AdminStatsDTO;
import com.weunite.api.admin.stats.dto.MonthlyDataDTO;
import com.weunite.api.admin.stats.dto.OpportunityCategoryWithSkillsDTO;
import com.weunite.api.admin.stats.dto.PreviousMonthStatsDTO;
import com.weunite.api.admin.stats.dto.UserTypeDataDTO;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.posts.repository.PostRepository;
import com.weunite.api.users.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável por calcular estatísticas do dashboard admin. Lida com métricas gerais, dados
 * mensais e distribuição de usuários.
 */
@Service
public class AdminStatsService {

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

  /** Calcula estatísticas gerais do dashboard */
  @Transactional(readOnly = true)
  public AdminStatsDTO getAdminStats() {
    Instant now = Instant.now();
    Instant tenDaysAgo = now.minus(10, ChronoUnit.DAYS);

    // Estatísticas do mês atual
    LocalDate today = LocalDate.now();
    LocalDate startOfMonth = today.withDayOfMonth(1);
    LocalDate startOfPreviousMonth = startOfMonth.minusMonths(1);
    LocalDate endOfPreviousMonth = startOfMonth.minusDays(1);

    Instant startOfLastMonth =
        startOfPreviousMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
    Instant endOfLastMonth =
        endOfPreviousMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

    // Totais atuais
    Long totalPosts = postRepository.count();
    Long totalOpportunities = opportunityRepository.count();
    Long activeUsers = userRepository.countActiveUsersByPostActivity(tenDaysAgo);

    // Calcular taxa de engajamento
    Long totalLikes = postRepository.countTotalLikes();
    Long totalComments = postRepository.countTotalComments();
    Double engagementRate =
        calculateEngagementRate(totalPosts, totalLikes, totalComments, activeUsers);

    // Estatísticas do mês anterior
    Long previousMonthPosts =
        postRepository.countPostsBetweenDates(startOfLastMonth, endOfLastMonth);
    Long previousMonthOpportunities =
        opportunityRepository.countOpportunitiesBetweenDates(startOfLastMonth, endOfLastMonth);

    // Para o mês anterior, vamos usar uma aproximação baseada na tendência
    Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
    Long previousActiveUsers = userRepository.countActiveUsersByPostActivity(thirtyDaysAgo);

    // Engajamento do mês anterior (simplificado)
    Double previousEngagementRate = engagementRate * 0.95; // Aproximação: 95% do atual

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
   * Calcula a taxa de engajamento. Fórmula: ((Likes + Comentários) / (Posts * Usuários ativos)) *
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

  /** Retorna dados mensais dos últimos 6 meses */
  @Transactional(readOnly = true)
  public List<MonthlyDataDTO> getMonthlyData() {
    LocalDate today = LocalDate.now();
    List<MonthlyDataDTO> monthlyData = new ArrayList<>();

    // Últimos 6 meses
    for (int i = 5; i >= 0; i--) {
      LocalDate targetMonth = today.minusMonths(i);
      LocalDate startOfMonth = targetMonth.withDayOfMonth(1);
      LocalDate endOfMonth = targetMonth.withDayOfMonth(targetMonth.lengthOfMonth());

      Instant startInstant = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
      Instant endInstant = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

      Long postsCount = postRepository.countPostsBetweenDates(startInstant, endInstant);
      Long opportunitiesCount =
          opportunityRepository.countOpportunitiesBetweenDates(startInstant, endInstant);

      // Nome do mês abreviado em português
      String monthName =
          targetMonth
              .getMonth()
              .getDisplayName(TextStyle.SHORT, new Locale("pt", "BR"))
              .substring(0, 3);

      monthlyData.add(
          new MonthlyDataDTO(
              monthName.substring(0, 1).toUpperCase() + monthName.substring(1),
              postsCount,
              opportunitiesCount));
    }

    return monthlyData;
  }

  /** Retorna distribuição de usuários por tipo */
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
   * Retorna top 5 skills mais frequentes baseado no número de oportunidades que as usam Simples:
   * apenas contar quantas oportunidades cada skill aparece
   */
  @Transactional(readOnly = true)
  public List<OpportunityCategoryWithSkillsDTO> getOpportunitiesWithSkills() {
    // Mapa para contar quantas oportunidades usam cada skill
    Map<String, Long> skillCountMap = new HashMap<>();

    try {
      // Buscar todas as oportunidades
      var allOpportunities = opportunityRepository.findAll();

      if (allOpportunities == null || allOpportunities.isEmpty()) {
        return new ArrayList<>();
      }

      // Contar: para cada skill única, quantas oportunidades a possuem
      for (var opportunity : allOpportunities) {
        if (opportunity.getSkills() != null && !opportunity.getSkills().isEmpty()) {
          // Usar Set para evitar contar a mesma skill múltiplas vezes na mesma oportunidade
          Set<String> uniqueSkillNames = new HashSet<>();
          for (var skill : opportunity.getSkills()) {
            if (skill != null && skill.getName() != null) {
              uniqueSkillNames.add(skill.getName());
            }
          }

          // Incrementar contagem para cada skill única
          for (String skillName : uniqueSkillNames) {
            skillCountMap.put(skillName, skillCountMap.getOrDefault(skillName, 0L) + 1);
          }
        }
      }

      // Se não houver skills, retornar lista vazia
      if (skillCountMap.isEmpty()) {
        return new ArrayList<>();
      }

      // Pegar top 5 skills mais frequentes e criar DTOs
      List<OpportunityCategoryWithSkillsDTO> result =
          skillCountMap.entrySet().stream()
              .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
              .limit(5)
              .map(
                  entry ->
                      new OpportunityCategoryWithSkillsDTO(
                          entry.getKey(), // skill name como "category"
                          entry.getValue(), // count de oportunidades
                          new ArrayList<>() // topSkills vazio (sem skills relacionadas)
                          ))
              .collect(Collectors.toList());

      return result;

    } catch (Exception e) {
      System.err.println("Erro ao buscar skills: " + e.getMessage());
      e.printStackTrace();
      return new ArrayList<>();
    }
  }
}
