package com.weunite.api.opportunities.mapper;

import com.weunite.api.opportunities.domain.Subscriber;
import com.weunite.api.opportunities.dto.SubscriberDTO;
import com.weunite.api.users.mapper.UserMapper;
import org.springframework.stereotype.Component;

@Component
public class SubscribersMapperImpl implements SubscribersMapper {

  private final UserMapper userMapper;
  private final OpportunityMapper opportunityMapper;

  public SubscribersMapperImpl(UserMapper userMapper, OpportunityMapper opportunityMapper) {
    this.userMapper = userMapper;
    this.opportunityMapper = opportunityMapper;
  }

  @Override
  public SubscriberDTO toSubscriberDTO(Subscriber subscriber) {
    return new SubscriberDTO(
        subscriber.getId(),
        userMapper.toUserDTO(subscriber.getAthlete()),
        opportunityMapper.toOpportunityDTO(subscriber.getOpportunity()));
  }
}