package com.example.weuniteauth.controller;


import com.example.weuniteauth.dto.Opportunity.OpportunityRequestDTO;
import com.example.weuniteauth.dto.OpportunityDTO;
import com.example.weuniteauth.dto.ResponseDTO;
import com.example.weuniteauth.service.OpportunityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@Validated
public class OpportunityController {

    private final OpportunityService opportunityService;

    public OpportunityController(OpportunityService opportunityService) {
        this.opportunityService = opportunityService;
    }

    @PostMapping(value = "/create/{companyId}")
    public ResponseEntity<ResponseDTO<OpportunityDTO>> createOpportunity(@PathVariable Long companyId,
                                                                         @RequestPart("opportunity") @Valid OpportunityRequestDTO opportunity
    ){
        ResponseDTO<OpportunityDTO> createdOpportunity = opportunityService.createOpportunity(companyId, opportunity);
        return ResponseEntity.status(HttpStatus.OK).body(createdOpportunity);
    }

    @PutMapping("/update/{companyId}/{opportunityId}")
    public ResponseEntity<ResponseDTO<OpportunityDTO>> updateOpportunity(@PathVariable Long companyId,
                                                                         @PathVariable Long opportunityId,
                                                                         @RequestBody @Valid OpportunityDTO opportunity
    ){
        ResponseDTO<OpportunityDTO> updatedOpportunity = opportunityService.updateOpportunity(companyId, opportunityId, opportunity);
        return ResponseEntity.status(HttpStatus.OK).body(updatedOpportunity);
    }

    @GetMapping("/get/{opportunityId}")
    public ResponseEntity<ResponseDTO<OpportunityDTO>> getOpportunity(@PathVariable Long opportunityId){
        ResponseDTO<OpportunityDTO> opportunity = opportunityService.getOpportunity(opportunityId);
        return ResponseEntity.status(HttpStatus.OK).body(opportunity);
    }

    @GetMapping ("/get")
    public ResponseEntity<List<OpportunityDTO>> getOpportunities(){
        List<OpportunityDTO> opportunities = opportunityService.getOpportunities();
        return ResponseEntity.status(HttpStatus.OK).body(opportunities);
    }

    @GetMapping("/get/company/{companyId}")
    public ResponseEntity<List<OpportunityDTO>> getOpportunitiesByCompanyId(@PathVariable Long companyId){
        List<OpportunityDTO> opportunities = opportunityService.getOpportunitiesByCompanyId(companyId);
        return ResponseEntity.status(HttpStatus.OK).body(opportunities);
    }

    @DeleteMapping("/delete/{companyId}/{opportunityId}")
    public ResponseEntity<ResponseDTO<OpportunityDTO>> deleteOpportunity(@PathVariable Long companyId, @PathVariable Long opportunityId){
        ResponseDTO<OpportunityDTO> opportunity = opportunityService.deleteOpportunity(companyId, opportunityId);
        return ResponseEntity.status(HttpStatus.OK).body(opportunity);
    }


}
