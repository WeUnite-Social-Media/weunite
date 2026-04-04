package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.common.exception.UnauthorizedException;
import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.opportunities.exception.OpportunityExpiredException;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.SubscribersMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.opportunities.service.SubscribersService;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.dto.UserDTO;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.AthleteRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SubscriberServiceTest {

  @Mock private SubscribersRepository subscribersRepository;
  @Mock private OpportunityRepository opportunityRepository;
  @Mock private AthleteRepository athleteRepository;
  @Mock private SubscribersMapper subscribersMapper;
  @Mock private NotificationService notificationService;

  @InjectMocks private SubscribersService subscribersService;

  private UserDTO buildAthleteDTO(Athlete athlete) {
    return new UserDTO(
        String.valueOf(athlete.getId()),
        athlete.getName(),
        athlete.getUsername(),
        "ATHLETE",
        null,
        athlete.getEmail(),
        athlete.getProfileImg(),
        athlete.getBannerImg(),
        false,
        null,
        null);
  }

  private OpportunityDTO buildOpportunityDTO(Opportunity opportunity) {
    return new OpportunityDTO(
        opportunity.getId(),
        opportunity.getTitle(),
        opportunity.getDescription(),
        opportunity.getLocation(),
        opportunity.getDateEnd(),
        Set.of(),
        Instant.now(),
        null,
        null,
        0);
  }

  @Test
  @DisplayName("Should create subscription successfully when athlete and active opportunity exist")
  void toggleSubscriberCreateSubscriptionSuccess() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);
    athlete.setUsername("athlete_test");

    Company company = new Company();
    company.setId(10L);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);
    opportunity.setTitle("Test Opportunity");
    opportunity.setDateEnd(LocalDate.now().plusDays(5));
    opportunity.setCompany(company);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(1L, buildAthleteDTO(athlete), buildOpportunityDTO(opportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity))
        .thenReturn(Optional.empty());
    when(subscribersMapper.toSubscriberDTO(any(Subscriber.class))).thenReturn(subscriberDTO);
    doCallRealMethod().when(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));

    var result = subscribersService.toggleSubscriber(athleteId, opportunityId);

    assertEquals(subscriberDTO, result.data());
    verify(subscribersRepository).save(any(Subscriber.class));
    verify(notificationService)
        .createNotification(
            company.getId(),
            NotificationType.OPPORTUNITY_SUBSCRIPTION,
            athleteId,
            opportunityId,
            null);
  }

  @Test
  @DisplayName("Should remove subscription successfully when subscription already exists")
  void toggleSubscriberRemoveSubscriptionSuccess() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);
    opportunity.setTitle("Test Opportunity");
    opportunity.setDateEnd(LocalDate.now().plusDays(5));

    Subscriber existingSubscriber = new Subscriber(athlete, opportunity);
    existingSubscriber.setId(1L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(1L, buildAthleteDTO(athlete), buildOpportunityDTO(opportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity))
        .thenReturn(Optional.of(existingSubscriber));
    when(subscribersMapper.toSubscriberDTO(any(Subscriber.class))).thenReturn(subscriberDTO);
    doCallRealMethod().when(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));

    var result = subscribersService.toggleSubscriber(athleteId, opportunityId);

    assertEquals(subscriberDTO, result.data());
    verify(subscribersRepository).delete(existingSubscriber);
  }

  @Test
  @DisplayName("Should block new subscription when opportunity deadline has passed")
  void toggleSubscriberExpiredOpportunityThrowsException() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);
    opportunity.setDateEnd(LocalDate.now().minusDays(1));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity))
        .thenReturn(Optional.empty());

    assertThrows(
        OpportunityExpiredException.class,
        () -> subscribersService.toggleSubscriber(athleteId, opportunityId));

    verify(subscribersRepository, never()).save(any(Subscriber.class));
    verifyNoInteractions(notificationService);
  }

  @Test
  @DisplayName("Should throw UserNotFoundException when athlete does not exist")
  void toggleSubscriberAthleteNotFoundThrowsException() {
    when(athleteRepository.findById(999L)).thenReturn(Optional.empty());

    assertThrows(
        UserNotFoundException.class, () -> subscribersService.toggleSubscriber(999L, 1L));

    verifyNoInteractions(opportunityRepository, subscribersRepository, subscribersMapper);
  }

  @Test
  @DisplayName("Should throw OpportunityNotFoundException when opportunity does not exist")
  void toggleSubscriberOpportunityNotFoundThrowsException() {
    Athlete athlete = new Athlete();
    athlete.setId(1L);

    when(athleteRepository.findById(1L)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(999L)).thenReturn(Optional.empty());

    assertThrows(
        OpportunityNotFoundException.class,
        () -> subscribersService.toggleSubscriber(1L, 999L));
  }

  @Test
  @DisplayName("Should return subscribers list successfully when owner requests it")
  void getSubscribersByOpportunitySuccess() {
    Long ownerId = 99L;
    Long opportunityId = 1L;

    Company company = new Company();
    company.setId(ownerId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);
    opportunity.setCompany(company);

    Athlete athlete = new Athlete();
    athlete.setId(1L);
    athlete.setName("Athlete One");
    athlete.setUsername("athlete1");

    Subscriber subscriber = new Subscriber(athlete, opportunity);
    subscriber.setId(1L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(1L, buildAthleteDTO(athlete), buildOpportunityDTO(opportunity));

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByOpportunityId(opportunityId)).thenReturn(List.of(subscriber));
    when(subscribersMapper.mapSubscribersToList(List.of(subscriber)))
        .thenReturn(List.of(subscriberDTO));

    List<SubscriberDTO> result =
        subscribersService.getSubscribersByOpportunity(ownerId, opportunityId);

    assertEquals(List.of(subscriberDTO), result);
  }

  @Test
  @DisplayName("Should reject subscribers list access for non-owner user")
  void getSubscribersByOpportunityUnauthorizedThrowsException() {
    Long ownerId = 99L;
    Long requesterId = 100L;
    Long opportunityId = 1L;

    Company company = new Company();
    company.setId(ownerId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);
    opportunity.setCompany(company);

    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));

    assertThrows(
        UnauthorizedException.class,
        () -> subscribersService.getSubscribersByOpportunity(requesterId, opportunityId));

    verify(subscribersRepository, never()).findByOpportunityId(opportunityId);
  }

  @Test
  @DisplayName("Should return true when athlete is subscribed to the opportunity")
  void isSubscribedReturnsTrue() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findByIdAndDeletedFalse(opportunityId))
        .thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity))
        .thenReturn(Optional.of(new Subscriber(athlete, opportunity)));

    boolean result = subscribersService.isSubscribed(athleteId, opportunityId);

    assertTrue(result);
  }

  @Test
  @DisplayName("Should return subscribers list for an athlete without deleted opportunities")
  void getSubscribersByAthleteSuccess() {
    Long athleteId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);
    athlete.setName("Athlete One");
    athlete.setUsername("athlete1");

    Opportunity opportunity = new Opportunity();
    opportunity.setId(10L);
    opportunity.setTitle("Test Opportunity");
    opportunity.setDateEnd(LocalDate.now().plusDays(10));

    Subscriber subscriber = new Subscriber(athlete, opportunity);
    subscriber.setId(5L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(5L, buildAthleteDTO(athlete), buildOpportunityDTO(opportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(subscribersRepository.findByAthleteIdAndOpportunityDeletedFalse(athleteId))
        .thenReturn(List.of(subscriber));
    when(subscribersMapper.mapSubscribersToList(List.of(subscriber)))
        .thenReturn(List.of(subscriberDTO));

    List<SubscriberDTO> result = subscribersService.getSubscribersByAthlete(athleteId);

    assertEquals(List.of(subscriberDTO), result);
  }
}
