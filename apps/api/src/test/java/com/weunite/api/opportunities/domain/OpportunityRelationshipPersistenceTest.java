package com.weunite.api.opportunities.domain;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.weunite.api.opportunities.repository.OpportunityRepository;
import com.weunite.api.opportunities.repository.SavedOpportunityRepository;
import com.weunite.api.opportunities.repository.SubscribersRepository;
import com.weunite.api.users.domain.Athlete;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.repository.AthleteRepository;
import com.weunite.api.users.repository.CompanyRepository;
import com.weunite.api.users.repository.RoleRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class OpportunityRelationshipPersistenceTest {

  @Autowired private AthleteRepository athleteRepository;

  @Autowired private CompanyRepository companyRepository;

  @Autowired private RoleRepository roleRepository;

  @Autowired private OpportunityRepository opportunityRepository;

  @Autowired private SavedOpportunityRepository savedOpportunityRepository;

  @Autowired private SubscribersRepository subscribersRepository;

  @Autowired private EntityManager entityManager;

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

  @Test
  @DisplayName("Should preload opportunity read-model associations explicitly")
  void preloadOpportunityReadModelAssociations() {
    Role companyRole = roleRepository.save(new Role(null, "COMPANY"));
    Company company = new Company("Company Read", "company_read", "read@example.com", "p");
    company.setRole(Set.of(companyRole));
    companyRepository.save(company);

    Athlete athlete =
        athleteRepository.save(new Athlete("Reader", "reader", "reader@example.com", "p"));

    Opportunity opportunity = new Opportunity();
    opportunity.setCompany(company);
    opportunity.setTitle("Read model");
    opportunity.setDescription("Description");
    opportunity.setLocation("Remote");
    opportunity.setDateEnd(LocalDate.now().plusDays(10));
    opportunityRepository.saveAndFlush(opportunity);
    subscribersRepository.saveAndFlush(new Subscriber(athlete, opportunity));

    entityManager.clear();

    Opportunity readModel =
        opportunityRepository.findReadModelByIdAndDeletedFalse(opportunity.getId()).orElseThrow();
    var persistenceUnitUtil = entityManager.getEntityManagerFactory().getPersistenceUnitUtil();

    assertTrue(persistenceUnitUtil.isLoaded(readModel, "company"));
    assertTrue(persistenceUnitUtil.isLoaded(readModel.getCompany(), "role"));
    assertTrue(persistenceUnitUtil.isLoaded(readModel, "skills"));
    assertTrue(persistenceUnitUtil.isLoaded(readModel, "subscribers"));
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
