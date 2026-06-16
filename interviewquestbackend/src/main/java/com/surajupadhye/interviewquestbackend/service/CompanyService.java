package com.surajupadhye.interviewquestbackend.service;

import com.surajupadhye.interviewquestbackend.entity.Company;
import com.surajupadhye.interviewquestbackend.exception.ResourceNotFoundException;
import com.surajupadhye.interviewquestbackend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    @Transactional
    public Company createCompany(Company company) {
        if (companyRepository.existsByName(company.getName())) {
            throw new IllegalArgumentException("Error: Company with name " + company.getName() + " already exists!");
        }
        return companyRepository.save(company);
    }

    @Transactional
    public Company updateCompany(Long id, Company updatedCompany) {
        Company existingCompany = getCompanyById(id);

        if (!existingCompany.getName().equalsIgnoreCase(updatedCompany.getName()) &&
                companyRepository.existsByName(updatedCompany.getName())) {
            throw new IllegalArgumentException("Error: Company with name " + updatedCompany.getName() + " already exists!");
        }

        existingCompany.setName(updatedCompany.getName());
        existingCompany.setLogoUrl(updatedCompany.getLogoUrl());
        existingCompany.setDescription(updatedCompany.getDescription());

        return companyRepository.save(existingCompany);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = getCompanyById(id);
        companyRepository.delete(company);
    }
}
