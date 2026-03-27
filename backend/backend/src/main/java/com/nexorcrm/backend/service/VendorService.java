package com.nexorcrm.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexorcrm.backend.dto.VendorRequest;
import com.nexorcrm.backend.dto.VendorResponse;
import com.nexorcrm.backend.entity.Vendor;
import com.nexorcrm.backend.repo.VendorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class VendorService {

    private final VendorRepository repo;
    private final ObjectMapper objectMapper;

    public VendorService(VendorRepository repo) {
        this.repo = repo;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional(readOnly = true)
    public List<VendorResponse> listVendors() {
        return repo.findByDeletedFalseOrderByIdDesc().stream().map(this::toResponse).toList();
    }

    public VendorResponse createVendor(VendorRequest req) {
        Vendor v = new Vendor();
        v.setVendorName(req.getVendorName().trim());
        v.setContactPerson(req.getContactPerson());
        v.setPhone(req.getPhone().trim());
        v.setEmail(req.getEmail());
        v.setAddress(req.getAddress());
        v.setMaterialsSupplied(req.getMaterialsSupplied());
        v.setCountryCode(req.getCountryCode());
        
        // Set new fields
        v.setVendorTypeIds(req.getVendorTypeIds());
        v.setProductIds(req.getProductIds());
        v.setBrandIds(req.getBrandIds());
        v.setDealsWith(req.getDealsWith());
        v.setInternalRepresentative(req.getInternalRepresentative());
        v.setRelationshipSince(req.getRelationshipSince());
        v.setCompanyWebsite(req.getCompanyWebsite());
        v.setCountryOfRegistration(req.getCountryOfRegistration());
        v.setCompanyRegistrationNo(req.getCompanyRegistrationNo());
        v.setGstNumber(req.getGstNumber());
        v.setPanNumber(req.getPanNumber());
        v.setCompanyAddress(req.getCompanyAddress());
        v.setStatus(req.getStatus() != null ? req.getStatus() : "active");
        v.setOfficialEmail(req.getOfficialEmail());
        v.setSecondaryEmail(req.getSecondaryEmail());
        
        v = repo.save(v);
        return toResponse(v);
    }

    public VendorResponse updateVendor(Long id, VendorRequest req) {
        Vendor v = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found"));
        if (v.isDeleted()) throw new EntityNotFoundException("Vendor not found");
        v.setVendorName(req.getVendorName().trim());
        v.setContactPerson(req.getContactPerson());
        v.setPhone(req.getPhone().trim());
        v.setEmail(req.getEmail());
        v.setAddress(req.getAddress());
        v.setMaterialsSupplied(req.getMaterialsSupplied());
        v.setCountryCode(req.getCountryCode());
        
        // Update new fields
        v.setVendorTypeIds(req.getVendorTypeIds());
        v.setProductIds(req.getProductIds());
        v.setBrandIds(req.getBrandIds());
        v.setDealsWith(req.getDealsWith());
        v.setInternalRepresentative(req.getInternalRepresentative());
        v.setRelationshipSince(req.getRelationshipSince());
        v.setCompanyWebsite(req.getCompanyWebsite());
        v.setCountryOfRegistration(req.getCountryOfRegistration());
        v.setCompanyRegistrationNo(req.getCompanyRegistrationNo());
        v.setGstNumber(req.getGstNumber());
        v.setPanNumber(req.getPanNumber());
        v.setCompanyAddress(req.getCompanyAddress());
        v.setStatus(req.getStatus() != null ? req.getStatus() : v.getStatus());
        v.setOfficialEmail(req.getOfficialEmail());
        v.setSecondaryEmail(req.getSecondaryEmail());
        
        v = repo.save(v);
        return toResponse(v);
    }

    public void deleteVendor(Long id) {
        Vendor v = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found"));
        v.setDeleted(true);
        repo.save(v);
    }

    private VendorResponse toResponse(Vendor v) {
        VendorResponse r = new VendorResponse();
        r.setId(v.getId());
        r.setVendorName(v.getVendorName());
        r.setContactPerson(v.getContactPerson());
        r.setPhone(v.getPhone());
        r.setEmail(v.getEmail());
        r.setAddress(v.getAddress());
        r.setMaterialsSupplied(v.getMaterialsSupplied());
        r.setCountryCode(v.getCountryCode());
        
        // Map new fields
        r.setVendorTypeIds(v.getVendorTypeIds());
        r.setProductIds(v.getProductIds());
        r.setBrandIds(v.getBrandIds());
        r.setDealsWith(v.getDealsWith());
        r.setInternalRepresentative(v.getInternalRepresentative());
        r.setRelationshipSince(v.getRelationshipSince());
        r.setCompanyWebsite(v.getCompanyWebsite());
        r.setCountryOfRegistration(v.getCountryOfRegistration());
        r.setCompanyRegistrationNo(v.getCompanyRegistrationNo());
        r.setGstNumber(v.getGstNumber());
        r.setPanNumber(v.getPanNumber());
        r.setCompanyAddress(v.getCompanyAddress());
        r.setStatus(v.getStatus());
        r.setOfficialEmail(v.getOfficialEmail());
        r.setSecondaryEmail(v.getSecondaryEmail());
        
        return r;
    }
}
