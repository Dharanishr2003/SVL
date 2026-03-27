import api from "../utils/api";

export async function getLeadFlow() {
  const response = await api.get("/api/flow");
  return response?.data || {};
}

export async function updateLeadFlow(payload) {
  const response = await api.put("/api/flow", payload);
  return response?.data || {};
}

export async function getDealFlow() {
  const response = await api.get("/api/deal-flow");
  return response?.data || {};
}

export async function updateDealFlow(payload) {
  const response = await api.put("/api/deal-flow", payload);
  return response?.data || {};
}
