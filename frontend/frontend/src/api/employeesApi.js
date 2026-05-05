import api from "../utils/api";

export async function getEmployees() {
  const response = await api.get("/api/employees");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function getAvailableEmployees() {
  const response = await api.get("/api/employees/available");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createEmployee(payload) {
  const response = await api.post("/api/employees", payload);
  return response?.data || null;
}

export async function onboardEmployee(formData) {
  const response = await api.post("/api/employees/onboard", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data || null;
}

export async function updateOnboardEmployee(id, formData) {
  const response = await api.put(`/api/employees/${id}/onboard`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data || null;
}

export async function updateEmployee(id, payload) {
  const response = await api.put(`/api/employees/${id}`, payload);
  return response?.data || null;
}

export async function deleteEmployee(id) {
  const response = await api.delete(`/api/employees/${id}`);
  return response?.data || null;
}

export async function generateEmployeeFormLink(employeeId) {
  const response = await api.post(`/api/employees/${employeeId}/form-link`);
  return response?.data || null;
}

export async function sendOfferLetterEmail(employeeId) {
  const response = await api.post(`/api/employees/${employeeId}/send-offer-letter`);
  return response?.data || null;
}

export async function resendOfferLetterEmail(employeeId) {
  const response = await api.post(`/api/employees/${employeeId}/resend-offer-letter`);
  return response?.data || null;
}

export async function getEmployeeVerification(employeeId) {
  const response = await api.get(`/api/employees/${employeeId}/verification`);
  return response?.data || null;
}

export async function verifyEmployeeFields(employeeId, payload) {
  const response = await api.post(`/api/employees/${employeeId}/verify-fields`, payload);
  return response?.data || null;
}

export async function resendRejectedEmployeeLink(employeeId) {
  const response = await api.post(`/api/employees/${employeeId}/resend-rejected-link`);
  return response?.data || null;
}

export async function resendProfileCompletionMail(employeeId) {
  const response = await api.post(`/api/employees/${employeeId}/resend-profile-completion-mail`);
  return response?.data || null;
}

export async function getPublicEmployeeForm(token) {
  const response = await api.get(`/api/public/employee-form/${token}`);
  return response?.data || null;
}

export async function submitPublicEmployeeForm(token, formData) {
  const response = await api.post(`/api/public/employee-form/${token}/submit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response?.data || null;
}
