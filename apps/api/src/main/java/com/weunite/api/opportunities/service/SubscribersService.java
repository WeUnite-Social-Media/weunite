package com.weunite.api.opportunities.service;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.opportunities.exception.OpportunityExpiredException;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.SubscribersMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.AthleteRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscribersService {

  private final SubscribersRepository subscribersRepository;
  private final OpportunityRepository opportunityRepository;
  private final AthleteRepository athleteRepository;
  private final SubscribersMapper subscribersMapper;
  private final NotificationService notificationService;

  public SubscribersService(
      SubscribersRepository subscribersRepository,
      OpportunityRepository opportunityRepository,
      AthleteRepository athleteRepository,
      SubscribersMapper subscribersMapper,
      NotificationService notificationService) {
    this.opportunityRepository = opportunityRepository;
    this.subscribersRepository = subscribersRepository;
    this.athleteRepository = athleteRepository;
    this.subscribersMapper = subscribersMapper;
    this.notificationService = notificationService;
  }

  @Transactional
  public ResponseDTO<SubscriberDTO> toggleSubscriber(Long athleteId, Long opportunityId) {
    Athlete athlete = athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);
    Opportunity opportunity = getActiveOpportunity(opportunityId);

    Subscriber existingSubscriber =
        subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity).orElse(null);

    if (existingSubscriber == null) {
      ensureOpportunityAcceptsSubscriptions(opportunity);

      Subscriber newSubscriber = new Subscriber(athlete, opportunity);
      opportunity.addSubscriber(newSubscriber);
      subscribersRepository.save(newSubscriber);
      notificationService.createNotification(
          opportunity.getCompany().getId(),
          NotificationType.OPPORTUNITY_SUBSCRIPTION,
          athleteId,
          opportunityId,
          null);
      return subscribersMapper.toResponseDTO("Inscricao criada com sucesso!", newSubscriber);
    }

    ResponseDTO<SubscriberDTO> response =
        subscribersMapper.toResponseDTO("Inscricao removida com sucesso!", existingSubscriber);

    opportunity.removeSubscriber(existingSubscriber);
    subscribersRepository.delete(existingSubscriber);
    return response;
  }

  @Transactional
  public List<SubscriberDTO> getSubscribersByOpportunity(Long userId, Long opportunityId) {
    Opportunity opportunity = getActiveOpportunity(opportunityId);

    if (!userId.equals(opportunity.getCompany().getId())) {
      throw new UnauthorizedException(
          "Voce nao possui autorizacao para visualizar os inscritos desta oportunidade.");
    }

    List<Subscriber> subscribers =
        subscribersRepository.findReadModelsByOpportunityId(opportunityId);
    return subscribersMapper.mapSubscribersToList(subscribers);
  }

  @Transactional(readOnly = true)
  public boolean isSubscribed(Long athleteId, Long opportunityId) {
    Athlete athlete = athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);
    Opportunity opportunity = getActiveOpportunity(opportunityId);

    return subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity).isPresent();
  }

  @Transactional(readOnly = true)
  public List<SubscriberDTO> getSubscribersByAthlete(Long athleteId) {
    return getSubscribersByAthlete(athleteId, 0, 10);
  }

  @Transactional(readOnly = true)
  public List<SubscriberDTO> getSubscribersByAthlete(Long athleteId, int page, int size) {
    athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);

    List<Subscriber> subscribers =
        subscribersRepository
            .findReadModelsByAthleteIdAndOpportunityDeletedFalse(athleteId, pageRequest(page, size))
            .getContent();
    return subscribersMapper.mapSubscribersToList(subscribers);
  }

  private Opportunity getActiveOpportunity(Long opportunityId) {
    return opportunityRepository
        .findByIdAndDeletedFalse(opportunityId)
        .orElseThrow(OpportunityNotFoundException::new);
  }

  private void ensureOpportunityAcceptsSubscriptions(Opportunity opportunity) {
    if (opportunity.getDateEnd() != null && opportunity.getDateEnd().isBefore(LocalDate.now())) {
      throw new OpportunityExpiredException();
    }
  }

  private PageRequest pageRequest(int page, int size) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);
    return PageRequest.of(safePage, safeSize);
  }
}
