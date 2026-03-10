package com.example.weuniteauth.service;

import com.example.weuniteauth.domain.opportunity.Opportunity;
import com.example.weuniteauth.domain.opportunity.Subscriber;
import com.example.weuniteauth.domain.users.Athlete;
import com.example.weuniteauth.dto.Opportunity.SubscriberDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.exceptions.opportunity.OpportunityNotFoundException;
import com.example.weuniteauth.exceptions.user.UserNotFoundException;
import com.example.weuniteauth.mapper.SubscribersMapper;
import com.example.weuniteauth.repository.OpportunityRepository;
import com.example.weuniteauth.repository.SubscribersRepository;
import com.example.weuniteauth.repository.user.AthleteRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubscriberServiceTest {

    @Mock
    private SubscribersRepository subscribersRepository;

    @Mock
    private OpportunityRepository opportunityRepository;

    @Mock
    private AthleteRepository athleteRepository;

    @Mock
    private SubscribersMapper subscribersMapper;

    @InjectMocks
    private SubscribersService subscribersService;

    // TOGGLE SUBSCRIBER TESTS

    @Test
    @DisplayName("Should create subscription successfully when athlete and opportunity exist and no subscription exists")
    void toggleSubscriber_CreateSubscription_Success() {
        // Arrange
        Long athleteId = 1L;
        Long opportunityId = 1L;

        Athlete mockAthlete = new Athlete();
        mockAthlete.setId(athleteId);
        mockAthlete.setUsername("athlete_test");

        Opportunity mockOpportunity = new Opportunity();
        mockOpportunity.setId(opportunityId);
        mockOpportunity.setTitle("Test Opportunity");

        Subscriber newSubscriber = new Subscriber(mockAthlete, mockOpportunity);
        newSubscriber.setId(1L);

        SubscriberDTO subscriberDTO = new SubscriberDTO(1L, mockAthlete, mockOpportunity);
        ResponseDTO<SubscriberDTO> expectedResponse = new ResponseDTO<>("Inscrição criada com sucesso!", subscriberDTO);

        when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
        when(subscribersRepository.findByAthleteAndOpportunity(mockAthlete, mockOpportunity))
                .thenReturn(Optional.empty());
        when(subscribersRepository.save(any(Subscriber.class))).thenReturn(newSubscriber);
        when(subscribersMapper.toResponseDTO(eq("Inscrição criada com sucesso!"), any(Subscriber.class)))
                .thenReturn(expectedResponse);

        // Act
        ResponseDTO<SubscriberDTO> result = subscribersService.toggleSubscriber(athleteId, opportunityId);

        // Assert
        assertNotNull(result);
        assertEquals("Inscrição criada com sucesso!", result.message());
        assertEquals(subscriberDTO, result.data());

        verify(athleteRepository).findById(athleteId);
        verify(opportunityRepository).findById(opportunityId);
        verify(subscribersRepository).findByAthleteAndOpportunity(mockAthlete, mockOpportunity);
        verify(subscribersRepository).save(any(Subscriber.class));
        verify(subscribersMapper).toResponseDTO(eq("Inscrição criada com sucesso!"), any(Subscriber.class));
    }

    @Test
    @DisplayName("Should remove subscription successfully when subscription already exists")
    void toggleSubscriber_RemoveSubscription_Success() {
        // Arrange
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

        SubscriberDTO subscriberDTO = new SubscriberDTO(1L, mockAthlete, mockOpportunity);
        ResponseDTO<SubscriberDTO> expectedResponse = new ResponseDTO<>("Inscrição removida com sucesso!", subscriberDTO);

        when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
        when(subscribersRepository.findByAthleteAndOpportunity(mockAthlete, mockOpportunity))
                .thenReturn(Optional.of(existingSubscriber));
        when(subscribersRepository.save(existingSubscriber)).thenReturn(existingSubscriber);
        when(subscribersMapper.toResponseDTO(eq("Inscrição removida com sucesso!"), eq(existingSubscriber)))
                .thenReturn(expectedResponse);

        // Act
        ResponseDTO<SubscriberDTO> result = subscribersService.toggleSubscriber(athleteId, opportunityId);

        // Assert
        assertNotNull(result);
        assertEquals("Inscrição removida com sucesso!", result.message());
        assertEquals(subscriberDTO, result.data());

        verify(athleteRepository).findById(athleteId);
        verify(opportunityRepository).findById(opportunityId);
        verify(subscribersRepository).findByAthleteAndOpportunity(mockAthlete, mockOpportunity);
        verify(subscribersRepository).save(existingSubscriber);
        verify(subscribersMapper).toResponseDTO(eq("Inscrição removida com sucesso!"), eq(existingSubscriber));
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when athlete does not exist")
    void toggleSubscriber_AthleteNotFound_ThrowsException() {
        // Arrange
        Long athleteId = 999L;
        Long opportunityId = 1L;

        when(athleteRepository.findById(athleteId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            subscribersService.toggleSubscriber(athleteId, opportunityId);
        });

        verify(athleteRepository).findById(athleteId);
        verifyNoInteractions(opportunityRepository, subscribersRepository, subscribersMapper);
    }

    @Test
    @DisplayName("Should throw OpportunityNotFoundException when opportunity does not exist")
    void toggleSubscriber_OpportunityNotFound_ThrowsException() {
        // Arrange
        Long athleteId = 1L;
        Long opportunityId = 999L;

        Athlete mockAthlete = new Athlete();
        mockAthlete.setId(athleteId);

        when(athleteRepository.findById(athleteId)).thenReturn(Optional.of(mockAthlete));
        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(OpportunityNotFoundException.class, () -> {
            subscribersService.toggleSubscriber(athleteId, opportunityId);
        });

        verify(athleteRepository).findById(athleteId);
        verify(opportunityRepository).findById(opportunityId);
        verifyNoInteractions(subscribersRepository, subscribersMapper);
    }

    // GET SUBSCRIBERS BY OPPORTUNITY TESTS

    @Test
    @DisplayName("Should return subscribers list successfully when opportunity exists")
    void getSubscribersByOpportunity_Success() {
        // Arrange
        Long opportunityId = 1L;

        Opportunity mockOpportunity = new Opportunity();
        mockOpportunity.setId(opportunityId);
        mockOpportunity.setTitle("Test Opportunity");

        Athlete athlete1 = new Athlete();
        athlete1.setId(1L);
        athlete1.setUsername("athlete1");

        Athlete athlete2 = new Athlete();
        athlete2.setId(2L);
        athlete2.setUsername("athlete2");

        Subscriber subscriber1 = new Subscriber(athlete1, mockOpportunity);
        subscriber1.setId(1L);

        Subscriber subscriber2 = new Subscriber(athlete2, mockOpportunity);
        subscriber2.setId(2L);

        List<Subscriber> subscribers = List.of(subscriber1, subscriber2);

        SubscriberDTO subscriberDTO1 = new SubscriberDTO(1L, athlete1, mockOpportunity);
        SubscriberDTO subscriberDTO2 = new SubscriberDTO(2L, athlete2, mockOpportunity);
        List<SubscriberDTO> expectedSubscriberDTOs = List.of(subscriberDTO1, subscriberDTO2);

        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
        when(subscribersRepository.findByOpportunityId(opportunityId)).thenReturn(subscribers);
        when(subscribersMapper.mapSubscribersToList(subscribers)).thenReturn(expectedSubscriberDTOs);

        // Act
        List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);

        // Assert
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
        // Arrange
        Long opportunityId = 1L;

        Opportunity mockOpportunity = new Opportunity();
        mockOpportunity.setId(opportunityId);
        mockOpportunity.setTitle("Test Opportunity");

        List<Subscriber> emptySubscribers = List.of();
        List<SubscriberDTO> emptySubscriberDTOs = List.of();

        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.of(mockOpportunity));
        when(subscribersRepository.findByOpportunityId(opportunityId)).thenReturn(emptySubscribers);
        when(subscribersMapper.mapSubscribersToList(emptySubscribers)).thenReturn(emptySubscriberDTOs);

        // Act
        List<SubscriberDTO> result = subscribersService.getSubscribersByOpportunity(opportunityId);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(opportunityRepository).findById(opportunityId);
        verify(subscribersRepository).findByOpportunityId(opportunityId);
        verify(subscribersMapper).mapSubscribersToList(emptySubscribers);
    }

    @Test
    @DisplayName("Should throw OpportunityNotFoundException when opportunity does not exist in getSubscribersByOpportunity")
    void getSubscribersByOpportunity_OpportunityNotFound_ThrowsException() {
        // Arrange
        Long opportunityId = 999L;

        when(opportunityRepository.findById(opportunityId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(OpportunityNotFoundException.class, () -> {
            subscribersService.getSubscribersByOpportunity(opportunityId);
        });

        verify(opportunityRepository).findById(opportunityId);
        verifyNoInteractions(subscribersRepository, subscribersMapper);
    }
}
