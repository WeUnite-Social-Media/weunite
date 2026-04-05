package com.weunite.api.opportunities.controller;

import com.weunite.api.opportunities.dto.SkillDTO;
import com.weunite.api.opportunities.service.SkillService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/opportunities/skills")
@Validated
public class SkillController {

  private final SkillService skillService;

  public SkillController(SkillService skillService) {
    this.skillService = skillService;
  }

  @GetMapping
  public ResponseEntity<List<SkillDTO>> getSkills() {
    List<SkillDTO> skills = skillService.getAllSkills();
    return ResponseEntity.status(HttpStatus.OK).body(skills);
  }
}
