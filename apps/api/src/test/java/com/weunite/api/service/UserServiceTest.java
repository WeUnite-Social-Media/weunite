package com.weunite.api.service;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weunite.api.common.storage.service.CloudinaryService;
import com.weunite.api.users.domain.Company;
import com.weunite.api.users.domain.Role;
import com.weunite.api.users.domain.User;
import com.weunite.api.users.dto.CreateUserRequestDTO;
import com.weunite.api.users.mapper.UserMapper;
import com.weunite.api.users.repository.RoleRepository;
import com.weunite.api.users.repository.UserRepository;
import com.weunite.api.users.service.AthleteProfileService;
import com.weunite.api.users.service.CompanyProfileService;
import com.weunite.api.users.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private UserMapper userMapper;

  @Mock private PasswordEncoder passwordEncoder;

  @Mock private RoleRepository roleRepository;

  @Mock private CloudinaryService cloudinaryService;

  @Mock private AthleteProfileService athleteProfileService;

  @Mock private CompanyProfileService companyProfileService;

  @InjectMocks private UserService userService;

  @Test
  @DisplayName("Should delegate company registration identifiers to the company profile service")
  void createCompanyUserWithProfileRegistrationDetails() {
    CreateUserRequestDTO requestDTO =
        new CreateUserRequestDTO(
            "Company User",
            "company_user",
            "company@example.com",
            "123456Cl@",
            "company",
            "12345678000199");
    Company company = new Company();
    Role companyRole = new Role(null, "COMPANY");

    when(userRepository.existsByUsernameOrEmail(requestDTO.username(), requestDTO.email()))
        .thenReturn(false);
    when(passwordEncoder.encode(requestDTO.password())).thenReturn("encoded");
    when(userMapper.toEntity(requestDTO)).thenReturn(company);
    when(roleRepository.findByName("COMPANY")).thenReturn(companyRole);
    when(userRepository.save(company)).thenReturn(company);

    User createdUser = userService.createUser(requestDTO);

    assertSame(company, createdUser);
    verify(companyProfileService).applyRegistrationDetails(company, "12345678000199");
    verify(userRepository).save(company);
  }
}
