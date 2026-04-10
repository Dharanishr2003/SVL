import api from "../utils/api";

export async function loginVendor(identifier, password) {
  const response = await api.post("/api/vendor-auth/login", {
    identifier,
    password,
  });
  return response?.data || null;
}
