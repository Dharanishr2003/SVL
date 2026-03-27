import api from "../utils/api";

export async function getOvertimes() {
  const response = await api.get("/api/overtime");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createOvertime(payload) {
  const response = await api.post("/api/overtime", payload);
  return response?.data || null;
}

export async function updateOvertime(id, payload) {
  const response = await api.put(`/api/overtime/${id}`, payload);
  return response?.data || null;
}

export async function deleteOvertime(id) {
  const response = await api.delete(`/api/overtime/${id}`);
  return response?.data || null;
}
