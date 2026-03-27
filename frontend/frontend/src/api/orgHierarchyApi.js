import api from "../utils/api";

export async function getInstitutions() {
  const response = await api.get("/api/org/institutions");
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createInstitution(name) {
  const response = await api.post("/api/org/institutions", {
    name,
    status: "ACTIVE",
  });
  return response?.data || null;
}

export async function getInstitutionCategories(institutionId) {
  if (!institutionId) return [];
  const response = await api.get("/api/org/categories", {
    params: { institutionId },
  });
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createInstitutionCategory(institutionId, name) {
  const response = await api.post("/api/org/categories", {
    institutionId: Number(institutionId),
    name,
    status: "ACTIVE",
  });
  return response?.data || null;
}

export async function getInstitutionTypes(institutionId, categoryId) {
  if (!institutionId || !categoryId) return [];
  const response = await api.get("/api/org/types", {
    params: { institutionId, categoryId },
  });
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createInstitutionType(institutionId, categoryId, name) {
  const response = await api.post("/api/org/types", {
    institutionId: Number(institutionId),
    categoryId: Number(categoryId),
    name,
    status: "ACTIVE",
  });
  return response?.data || null;
}

export async function getDepartments(institutionId, categoryId, typeId) {
  if (!institutionId || !categoryId || !typeId) return [];
  const response = await api.get("/api/org/departments", {
    params: { institutionId, categoryId, typeId },
  });
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createDepartment(
  institutionId,
  categoryId,
  typeId,
  name,
  status = "ACTIVE",
) {
  const response = await api.post("/api/org/departments", {
    institutionId: Number(institutionId),
    categoryId: Number(categoryId),
    typeId: Number(typeId),
    name,
    status,
  });
  return response?.data || null;
}

export async function getTeams(
  institutionId,
  categoryId,
  typeId,
  departmentId,
) {
  if (!institutionId || !categoryId || !typeId || !departmentId) return [];
  const response = await api.get("/api/org/teams", {
    params: { institutionId, categoryId, typeId, departmentId },
  });
  return Array.isArray(response?.data) ? response.data : [];
}

export async function createTeam(
  institutionId,
  categoryId,
  typeId,
  departmentId,
  name,
) {
  const response = await api.post("/api/org/teams", {
    institutionId: Number(institutionId),
    categoryId: Number(categoryId),
    typeId: Number(typeId),
    departmentId: Number(departmentId),
    name,
    status: "ACTIVE",
  });
  return response?.data || null;
}

export async function getUserOrgSelection(userId) {
  if (!userId) return null;
  const response = await api.get(`/api/org/user/${userId}`);
  return response?.data || null;
}
