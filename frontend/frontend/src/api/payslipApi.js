import api from "../utils/api";

export async function getPayslips() {
  const response = await api.get("/api/payslips");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createPayslip(payload) {
  const response = await api.post("/api/payslips", payload);
  return response?.data || null;
}

export async function deletePayslip(id) {
  const response = await api.delete(`/api/payslips/${id}`);
  return response?.data || null;
}
