import apiClient from "./apiClient";

const crmService = {
  getCallHistory() {
    return apiClient.get("/crm/call-history");
  },
  getCandidatesGrid() {
    return apiClient.get("/crm/candidates-grid");
  },
  getCategories() {
    return apiClient.get("/crm/categories");
  },
  getCities() {
    return apiClient.get("/crm/cities");
  },
  getClientsGrid() {
    return apiClient.get("/crm/clients-grid");
  },
  getCompaniesGrid() {
    return apiClient.get("/crm/companies-grid");
  },
  getCompanies() {
    return apiClient.get("/crm/companies");
  },
  getContactsGrid() {
    return apiClient.get("/crm/contacts-grid");
  },
  getDealsDashboard() {
    return apiClient.get("/crm/deals-dashboard");
  },
  getLeadsDashboard() {
    return apiClient.get("/crm/leads-dashboard");
  },
  getDealsGrid() {
    return apiClient.get("/crm/deals-grid");
  },
  getChat() {
    return apiClient.get("/crm/chat");
  },
};

export default crmService;
