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
