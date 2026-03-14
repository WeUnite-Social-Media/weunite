package com.weunite.api.opportunities.service;

import com.weunite.api.common.response.ResponseDTO;
import com.weunite.api.opportunities.domain.Opportunity;
import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.opportunities.exception.OpportunityNotFoundException;
import com.weunite.api.opportunities.mapper.SubscribersMapper;
import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.exception.UserNotFoundException;
import com.weunite.api.users.repository.AthleteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscribersService {

  private final SubscribersRepository subscribersRepository;
  private final OpportunityRepository opportunityRepository;
  private final AthleteRepository athleteRepository;
  private final SubscribersMapper subscribersMapper;

  public SubscribersService(
      SubscribersRepository subscribersRepository,
      OpportunityRepository opportunityRepository,
      AthleteRepository athleteRepository,
      SubscribersMapper subscribersMapper) {
    this.opportunityRepository = opportunityRepository;
    this.subscribersRepository = subscribersRepository;
    this.athleteRepository = athleteRepository;
    this.subscribersMapper = subscribersMapper;
  }

  @Transactional
  public ResponseDTO<SubscriberDTO> toggleSubscriber(Long athleteId, Long opportunityId) {

    Athlete athlete = athleteRepository.findById(athleteId).orElseThrow(UserNotFoundException::new);

    Opportunity opportunity =
        opportunityRepository
            .findById(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    Subscriber existingSubscriber =
        subscribersRepository.findByAthleteAndOpportunity(athlete, opportunity).orElse(null);

    if (existingSubscriber == null) {
      Subscriber newSubscriber = new Subscriber(athlete, opportunity);
      opportunity.addSubscriber(newSubscriber);
      subscribersRepository.save(newSubscriber);
      return subscribersMapper.toResponseDTO("Inscrição criada com sucesso!", newSubscriber);
    } else {
      opportunity.removeSubscriber(existingSubscriber);
      subscribersRepository.save(existingSubscriber);
      return subscribersMapper.toResponseDTO("Inscrição removida com sucesso!", existingSubscriber);
    }
  }

  @Transactional
  public List<SubscriberDTO> getSubscribersByOpportunity(Long opportunityId) {
    Opportunity opportunity =
        opportunityRepository
            .findById(opportunityId)
            .orElseThrow(OpportunityNotFoundException::new);

    List<Subscriber> subscribers = subscribersRepository.findByOpportunityId(opportunityId);
    return subscribersMapper.mapSubscribersToList(subscribers);
  }
}
