package com.nexorcrm.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexorcrm.backend.dto.LeadFlowRequest;
import com.nexorcrm.backend.dto.LeadFlowResponse;
import com.nexorcrm.backend.entity.LeadFlowConfig;
import com.nexorcrm.backend.entity.LeadStatus;
import com.nexorcrm.backend.repo.LeadFlowConfigRepository;
import com.nexorcrm.backend.repo.LeadStatusRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class LeadFlowService {

    private static final Long FLOW_ID = 1L;

    private final LeadFlowConfigRepository leadFlowConfigRepository;
    private final LeadStatusRepository leadStatusRepository;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<LeadService> leadServiceProvider;

    public LeadFlowService(LeadFlowConfigRepository leadFlowConfigRepository,
                           LeadStatusRepository leadStatusRepository,
                           ObjectMapper objectMapper,
                           ObjectProvider<LeadService> leadServiceProvider) {
        this.leadFlowConfigRepository = leadFlowConfigRepository;
        this.leadStatusRepository = leadStatusRepository;
        this.objectMapper = objectMapper;
        this.leadServiceProvider = leadServiceProvider;
    }

    @Transactional(readOnly = true)
    public LeadFlowResponse getFlow() {
        LeadFlowConfig config = leadFlowConfigRepository.findById(FLOW_ID).orElseGet(() -> {
            LeadFlowConfig created = new LeadFlowConfig();
            created.setId(FLOW_ID);
            return created;
        });
        return toResponse(config);
    }

    @Transactional
    public LeadFlowResponse updateFlow(LeadFlowRequest request, String actorPrincipal) {
        LeadFlowConfig config = leadFlowConfigRepository.findById(FLOW_ID).orElseGet(() -> {
            LeadFlowConfig created = new LeadFlowConfig();
            created.setId(FLOW_ID);
            return created;
        });
        config.setDefaultGroupId(request.getDefaultGroupId());
        config.setRulesJson(serializeRules(request.getRules()));
        config.setStatusesJson(serializeStatuses(request.getStatuses()));
        if (StringUtils.hasText(actorPrincipal)) {
            config.setUpdatedBy(actorPrincipal);
        }
        LeadFlowConfig saved = leadFlowConfigRepository.save(config);

        // Ensure all statuses referenced by the flow configuration are available
        // in the global lead status list (used by the lead editor / list UI).
        syncStatusesFromFlowRules(request.getRules());

        // after updating the flow configuration we need to ensure any existing
        // leads that are currently sitting in a status whose handled-by group was
        // just changed get reassigned to a member of the new group.  this keeps
        // the UI consistent (owner matches the flow) and prevents leads from
        // remaining owned by a payment user when they should belong to another team.
        try {
            LeadService leadService = leadServiceProvider.getIfAvailable();
            if (leadService != null) {
                leadService.reassignLeadsForFlow(request.getRules());
            }
        } catch (Exception ignore) {
            // don't let reassign failures block the flow update
        }

        return toResponse(saved);
    }

    private void syncStatusesFromFlowRules(List<Map<String, Object>> rules) {
        if (rules == null) return;

        Set<String> statuses = new HashSet<>();
        for (Map<String, Object> rule : rules) {
            if (rule == null) continue;
            String status = String.valueOf(rule.get("status") != null ? rule.get("status") : "").trim();
            if (!status.isEmpty()) {
                statuses.add(status);
            }
            Object next = rule.get("next");
            if (next instanceof Map<?, ?> nextMap) {
                for (Object key : nextMap.keySet()) {
                    String nextStatus = String.valueOf(key != null ? key : "").trim();
                    if (nextStatus.isEmpty()) continue;
                    statuses.add(nextStatus);
                }
            }
        }

        for (String status : statuses) {
            if (leadStatusRepository.existsByStatusNameIgnoreCaseAndDeletedFalse(status)) {
                continue;
            }
            Optional<LeadStatus> existing = leadStatusRepository.findByStatusNameIgnoreCase(status);
            if (existing.isPresent()) {
                LeadStatus row = existing.get();
                if (row.isDeleted()) {
                    row.setDeleted(false);
                    leadStatusRepository.save(row);
                }
                continue;
            }
            LeadStatus row = new LeadStatus();
            row.setStatusId(generateStatusId());
            row.setStatusName(status);
            leadStatusRepository.save(row);
        }
    }

    private String generateStatusId() {
        return "LDSTS_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
    }

    private String serializeRules(List<Map<String, Object>> rules) {
        try {
            if (rules == null) {
                return null;
            }
            return objectMapper.writeValueAsString(rules);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to save flow rules");
        }
    }

    private List<Map<String, Object>> parseRules(String json) {
        try {
            if (!StringUtils.hasText(json)) {
                return Collections.emptyList();
            }
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private String serializeStatuses(List<String> statuses) {
        try {
            if (statuses == null) return null;
            return objectMapper.writeValueAsString(statuses);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to save flow statuses");
        }
    }

    private List<String> parseStatuses(String json) {
        try {
            if (!StringUtils.hasText(json)) return null;
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    private LeadFlowResponse toResponse(LeadFlowConfig config) {
        LeadFlowResponse response = new LeadFlowResponse();
        response.setDefaultGroupId(config.getDefaultGroupId());
        response.setRules(parseRules(config.getRulesJson()));
        response.setStatuses(parseStatuses(config.getStatusesJson()));
        response.setUpdatedBy(config.getUpdatedBy());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }
}
