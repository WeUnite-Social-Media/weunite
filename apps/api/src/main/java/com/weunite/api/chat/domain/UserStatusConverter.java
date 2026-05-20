package com.weunite.api.chat.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, String> {

  @Override
  public String convertToDatabaseColumn(UserStatus attribute) {
    return attribute != null ? attribute.name() : UserStatus.OFFLINE.name();
  }

  @Override
  public UserStatus convertToEntityAttribute(String dbData) {
    return UserStatus.from(dbData);
  }
}
