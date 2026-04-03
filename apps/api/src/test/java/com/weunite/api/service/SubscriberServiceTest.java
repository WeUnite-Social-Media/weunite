package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.weunite.api.notifications.domain.NotificationType;
import com.weunite.api.notifications.service.NotificationService;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.OpportunityDTO;
import com.weunite.api.opportunities.dto.SubscriberDTO;
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
public class SubscriberServiceTest {

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
  @DisplayName(
      "Should create subscription successfully when athlete and opportunity exist and no subscription exists")
  void toggleSubscriber_CreateSubscription_Success() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete mockAthlete = new Athlete();
    mockAthlete.setId(athleteId);
    mockAthlete.setUsername("athlete_test");

    Opportunity mockOpportunity = new Opportunity();
    mockOpportunity.setId(opportunityId);
    mockOpportunity.setTitle("Test Opportunity");
    Company company = new Company();
    company.setId(10L);
    mockOpportunity.setCompany(company);

    Subscriber newSubscriber = new Subscriber(mockAthlete, mockOpportunity);
    newSubscriber.setId(1L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(1L, buildAthleteDTO(mockAthlete), buildOpportunityDTO(mockOpportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(mockAthlete, mockOpportunity))
        .thenReturn(Optional.empty());
    when(subscribersRepository.save(any(Subscriber.class))).thenReturn(newSubscriber);
    when(subscribersMapper.toSubscriberDTO(any(Subscriber.class))).thenReturn(subscriberDTO);
    doCallRealMethod().when(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));

    var result = subscribersService.toggleSubscriber(athleteId, opportunityId);

    assertNotNull(result);
    assertNotNull(result.message());
    assertEquals(subscriberDTO, result.data());

    verify(athleteRepository).findById(athleteId);
    verify(opportunityRepository).findById(opportunityId);
    verify(subscribersRepository).findByAthleteAndOpportunity(mockAthlete, mockOpportunity);
    verify(subscribersRepository).save(any(Subscriber.class));
    verify(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));
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
  void toggleSubscriber_RemoveSubscription_Success() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete mockAthlete = new Athlete();
    mockAthlete.setId(athleteId);
    mockAthlete.setUsername("athlete_test");

    Opportunity mockOpportunity = new Opportunity();
    mockOpportunity.setId(opportunityId);
    mockOpportunity.setTitle("Test Opportunity");

    Subscriber existingSubscriber = new Subscriber(mockAthlete, mockOpportunity);
    existingSubscriber.setId(1L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(1L, buildAthleteDTO(mockAthlete), buildOpportunityDTO(mockOpportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(mockAthlete, mockOpportunity))
        .thenReturn(Optional.of(existingSubscriber));
    when(subscribersMapper.toSubscriberDTO(any(Subscriber.class))).thenReturn(subscriberDTO);
    doCallRealMethod().when(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));

    var result = subscribersService.toggleSubscriber(athleteId, opportunityId);

    assertNotNull(result);
    assertNotNull(result.message());
    assertEquals(subscriberDTO, result.data());

    verify(athleteRepository).findById(athleteId);
    verify(opportunityRepository).findById(opportunityId);
    verify(subscribersRepository).findByAthleteAndOpportunity(mockAthlete, mockOpportunity);
    verify(subscribersRepository).delete(existingSubscriber);
    verify(subscribersMapper).toResponseDTO(anyString(), any(Subscriber.class));
  }

  @Test
  @DisplayName("Should throw UserNotFoundException when athlete does not exist")
  void toggleSubscriber_AthleteNotFound_ThrowsException() {
    Long athleteId = 999L;
    Long opportunityId = 1L;

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.empty());

    assertThrows(
        UserNotFoundException.class,
        () -> subscribersService.toggleSubscriber(athleteId, opportunityId));

    verify(athleteRepository).findById(athleteId);
    verifyNoInteractions(opportunityRepository, subscribersRepository, subscribersMapper);
  }

  @Test
  @DisplayName("Should throw OpportunityNotFoundException when opportunity does not exist")
  void toggleSubscriber_OpportunityNotFound_ThrowsException() {
    Long athleteId = 1L;
    Long opportunityId = 999L;

    Athlete mockAthlete = new Athlete();
    mockAthlete.setId(athleteId);

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

    assertThrows(
        OpportunityNotFoundException.class,
        () -> subscribersService.toggleSubscriber(athleteId, opportunityId));

    verify(athleteRepository).findById(athleteId);
    verify(opportunityRepository).findById(opportunityId);
    verifyNoInteractions(subscribersRepository, subscribersMapper);
  }

  @Test
  @DisplayName("Should return subscribers list successfully when opportunity exists")
  void getSubscribersByOpportunity_Success() {
    Long opportunityId = 1L;

    Opportunity mockOpportunity = new Opportunity();
    mockOpportunity.setId(opportunityId);
    mockOpportunity.setTitle("Test Opportunity");

    Athlete athlete1 = new Athlete();
    athlete1.setId(1L);
    athlete1.setName("Athlete One");
    athlete1.setUsername("athlete1");

    Athlete athlete2 = new Athlete();
    athlete2.setId(2L);
    athlete2.setName("Athlete Two");
    athlete2.setUsername("athlete2");

    Subscriber subscriber1 = new Subscriber(athlete1, mockOpportunity);
    subscriber1.setId(1L);

    Subscriber subscriber2 = new Subscriber(athlete2, mockOpportunity);
    subscriber2.setId(2L);

    List<Subscriber> subscribers = List.of(subscriber1, subscriber2);

    SubscriberDTO subscriberDTO1 =
        new SubscriberDTO(1L, buildAthleteDTO(athlete1), buildOpportunityDTO(mockOpportunity));
    SubscriberDTO subscriberDTO2 =
        new SubscriberDTO(2L, buildAthleteDTO(athlete2), buildOpportunityDTO(mockOpportunity));
    List<SubscriberDTO> expectedSubscriberDTOs = List.of(subscriberDTO1, subscriberDTO2);

    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
    when(subscribersRepository.findByOpportunityId(opportunityId)).thenReturn(subscribers);
    when(subscribersMapper.mapSubscribersToList(subscribers)).thenReturn(expectedSubscriberDTOs);

    List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);

    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals(expectedSubscriberDTOs, result);

    verify(opportunityRepository).findById(opportunityId);
    verify(subscribersRepository).findByOpportunityId(opportunityId);
    verify(subscribersMapper).mapSubscribersToList(subscribers);
  }

  @Test
  @DisplayName("Should return empty list when opportunity has no subscribers")
  void getSubscribersByOpportunity_EmptyList_Success() {
    Long opportunityId = 1L;

    Opportunity mockOpportunity = new Opportunity();
    mockOpportunity.setId(opportunityId);
    mockOpportunity.setTitle("Test Opportunity");

    List<Subscriber> emptySubscribers = List.of();
    List<SubscriberDTO> emptySubscriberDTOs = List.of();

    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
    when(subscribersRepository.findByOpportunityId(opportunityId)).thenReturn(emptySubscribers);
    when(subscribersMapper.mapSubscribersToList(emptySubscribers)).thenReturn(emptySubscriberDTOs);

    List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);

    assertNotNull(result);
    assertTrue(result.isEmpty());

    verify(opportunityRepository).findById(opportunityId);
    verify(subscribersRepository).findByOpportunityId(opportunityId);
    verify(subscribersMapper).mapSubscribersToList(emptySubscribers);
  }

  @Test
  @DisplayName(
      "Should throw OpportunityNotFoundException when opportunity does not exist in getSubscribersByOpportunity")
  void getSubscribersByOpportunity_OpportunityNotFound_ThrowsException() {
    Long opportunityId = 999L;

    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

    assertThrows(
        OpportunityNotFoundException.class,
        () -> subscribersService.getSubscribersByOpportunity(opportunityId));

    verify(opportunityRepository).findById(opportunityId);
    verifyNoInteractions(subscribersRepository, subscribersMapper);
  }

  @Test
  @DisplayName("Should return true when athlete is subscribed to the opportunity")
  void isSubscribed_ReturnsTrue() {
    Long athleteId = 1L;
    Long opportunityId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);

    Opportunity opportunity = new Opportunity();
    opportunity.setId(opportunityId);

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(opportunity));
    when(subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity))
        .thenReturn(Optional.of(new Subscriber(athlete, opportunity)));

    boolean result = subscribersService.isSubscribed(athleteId, opportunityId);

    assertTrue(result);
    verify(athleteRepository).findById(athleteId);
    verify(opportunityRepository).findById(opportunityId);
    verify(subscribersRepository).findByAthleteAndOpportunity(athlete, opportunity);
  }

  @Test
  @DisplayName("Should return subscribers list for a specific athlete")
  void getSubscribersByAthlete_Success() {
    Long athleteId = 1L;

    Athlete athlete = new Athlete();
    athlete.setId(athleteId);
    athlete.setName("Athlete One");
    athlete.setUsername("athlete1");

    Opportunity opportunity = new Opportunity();
    opportunity.setId(10L);
    opportunity.setTitle("Test Opportunity");
    opportunity.setDateEnd(LocalDate.of(2026, 12, 31));

    Subscriber subscriber = new Subscriber(athlete, opportunity);
    subscriber.setId(5L);

    SubscriberDTO subscriberDTO =
        new SubscriberDTO(5L, buildAthleteDTO(athlete), buildOpportunityDTO(opportunity));

    when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(athlete));
    when(subscribersRepository.findByAthleteId(athleteId)).thenReturn(List.of(subscriber));
    when(subscribersMapper.mapSubscribersToList(List.of(subscriber)))
        .thenReturn(List.of(subscriberDTO));

    List<SubscriberDTO> result = subscribersService.getSubscribersByAthlete(athleteId);

    assertEquals(List.of(subscriberDTO), result);
    verify(athleteRepository).findById(athleteId);
    verify(subscribersRepository).findByAthleteId(athleteId);
    verify(subscribersMapper).mapSubscribersToList(List.of(subscriber));
  }
}
