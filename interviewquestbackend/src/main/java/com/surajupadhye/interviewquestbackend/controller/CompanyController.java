package com.surajupadhye.interviewquestbackend.controller;

import com.surajupadhye.interviewquestbackend.entity.Company;
import com.surajupadhye.interviewquestbackend.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    // Public API - Browsing companies
    @GetMapping("/api/public/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/api/public/companies/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    // Admin API - Creating, updating, deleting companies
    @PostMapping("/api/admin/companies")
    public ResponseEntity<Company> createCompany(@Valid @RequestBody Company company) {
        Company createdCompany = companyService.createCompany(company);
        return new ResponseEntity<>(createdCompany, HttpStatus.CREATED);
    }

    @PutMapping("/api/admin/companies/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @Valid @RequestBody Company company) {
        Company updatedCompany = companyService.updateCompany(id, company);
        return ResponseEntity.ok(updatedCompany);
    }

    @DeleteMapping("/api/admin/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}
