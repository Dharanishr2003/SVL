import api from "../utils/api";

export async function getQuotationTemplate() {
  const response = await api.get("/api/quotation-template");
  return response.data;
}

export async function saveQuotationTemplate(payload) {
  const response = await api.post("/api/quotation-template", payload);
  return response.data;
}
