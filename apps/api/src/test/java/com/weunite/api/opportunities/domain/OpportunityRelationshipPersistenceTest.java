package com.weunite.api.opportunities.domain;

import static org.junit.jupiter.api.Assertions.assertThrows;

import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SavedOpportunityRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.repository.AthleteRepository;
import com.weunite.api.users.repository.CompanyRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class OpportunityRelationshipPersistenceTest {

  @Autowired private AthleteRepository athleteRepository;

  @Autowired private CompanyRepository companyRepository;

  @Autowired private OpportunityRepository opportunityRepository;

  @Autowired private SavedOpportunityRepository savedOpportunityRepository;

  @Autowired private SubscribersRepository subscribersRepository;

  @Test
  @DisplayName("Should enforce one subscription per athlete and opportunity")
  void enforceUniqueSubscription() {
    Athlete athlete =
        athleteRepository.save(new Athlete("Athlete", "athlete", "a@example.com", "p"));
    Opportunity opportunity = opportunityRepository.save(buildOpportunity());

    subscribersRepository.saveAndFlush(new Subscriber(athlete, opportunity));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> subscribersRepository.saveAndFlush(new Subscriber(athlete, opportunity)));
  }

  @Test
  @DisplayName("Should enforce one saved opportunity per athlete and opportunity")
  void enforceUniqueSavedOpportunity() {
    Athlete athlete =
        athleteRepository.save(new Athlete("Saved Athlete", "saved_athlete", "s@example.com", "p"));
    Opportunity opportunity = opportunityRepository.save(buildOpportunity());

    savedOpportunityRepository.saveAndFlush(new SavedOpportunity(athlete, opportunity));

    assertThrows(
        DataIntegrityViolationException.class,
        () -> savedOpportunityRepository.saveAndFlush(new SavedOpportunity(athlete, opportunity)));
  }

  private Opportunity buildOpportunity() {
    Company company =
        companyRepository.save(new Company("Company", "company", "c@example.com", "p"));
    Opportunity opportunity = new Opportunity();
    opportunity.setCompany(company);
    opportunity.setTitle("Opportunity");
    opportunity.setDescription("Description");
    opportunity.setLocation("Remote");
    opportunity.setDateEnd(LocalDate.now().plusDays(10));
    return opportunity;
  }
}
