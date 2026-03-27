import api from '../utils/api'

function normalizeGroup(row) {
  return {
    id: row?.id,
    name: row?.name || '',
    level: Number(row?.groupLevel ?? 0),
    members: Number(row?.members ?? 0),
    canDelete: Boolean(row?.canDelete),
    institutionName: row?.institutionName || '',
    institutionCategory: row?.institutionCategory || '',
    institutionType: row?.institutionType || '',
    departmentName: row?.departmentName || '',
    teamNames: Array.isArray(row?.teamNames) ? row.teamNames : [],
    pageKeys: Array.isArray(row?.pageKeys) ? row.pageKeys : [],
  }
}

export async function getUserGroups() {
  const response = await api.get('/api/user-groups')
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map(normalizeGroup)
}

export async function createUserGroup(payload) {
  const response = await api.post('/api/user-groups', {
    name: payload?.name,
    groupLevel: payload?.level,
    institutionName: payload?.institutionName,
    institutionCategory: payload?.institutionCategory,
    institutionType: payload?.institutionType,
    departmentName: payload?.departmentName,
    teamNames: Array.isArray(payload?.teamNames) ? payload.teamNames : [],
    pageKeys: Array.isArray(payload?.pageKeys) ? payload.pageKeys : [],
  })
  return normalizeGroup(response?.data || {})
}

export async function updateUserGroup(groupId, payload) {
  const response = await api.put(`/api/user-groups/${groupId}`, {
    name: payload?.name,
    groupLevel: payload?.level,
    institutionName: payload?.institutionName,
    institutionCategory: payload?.institutionCategory,
    institutionType: payload?.institutionType,
    departmentName: payload?.departmentName,
    teamNames: Array.isArray(payload?.teamNames) ? payload.teamNames : [],
    pageKeys: Array.isArray(payload?.pageKeys) ? payload.pageKeys : [],
  })
  return normalizeGroup(response?.data || {})
}

export async function deleteUserGroup(groupId) {
  await api.delete(`/api/user-groups/${groupId}`)
  return true
}

export async function getAssignableUsersForGroup({ groupId, teams } = {}) {
  const params = {}
  if (groupId != null) params.groupId = groupId
  if (Array.isArray(teams) && teams.length > 0) params.teams = teams
  const response = await api.get('/api/user-groups/assignable-users', { params })
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => ({
    id: row?.id,
    username: row?.username || '',
    role: row?.role || '',
  }))
}

export async function getAssignableTeamsForGroup(scope = {}) {
  const params = {}
  if (scope?.institutionName) params.institutionName = scope.institutionName
  if (scope?.institutionCategory) params.institutionCategory = scope.institutionCategory
  if (scope?.institutionType) params.institutionType = scope.institutionType
  if (scope?.departmentName) params.departmentName = scope.departmentName
  const response = await api.get('/api/user-groups/assignable-teams', { params })
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows
    .map((row) => String(row?.teamName || '').trim())
    .filter(Boolean)
}

export async function getMyPageVisibility() {
  const response = await api.get('/api/user-groups/my-visibility')
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => String(row || '').trim()).filter(Boolean)
}

export async function getGroupMembers(groupId) {
  const response = await api.get(`/api/user-groups/${groupId}/members`)
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => ({
    userId: row?.userId,
    username: row?.username || '',
    role: row?.role || '',
    pageKeys: Array.isArray(row?.pageKeys) ? row.pageKeys : [],
  }))
}

export async function addGroupMember(groupId, userId) {
  const response = await api.post(`/api/user-groups/${groupId}/members`, null, { params: { userId } })
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => ({
    userId: row?.userId,
    username: row?.username || '',
    role: row?.role || '',
    pageKeys: Array.isArray(row?.pageKeys) ? row.pageKeys : [],
  }))
}

export async function removeGroupMember(groupId, userId) {
  const response = await api.delete(`/api/user-groups/${groupId}/members/${userId}`)
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => ({
    userId: row?.userId,
    username: row?.username || '',
    role: row?.role || '',
    pageKeys: Array.isArray(row?.pageKeys) ? row.pageKeys : [],
  }))
}

export async function updateGroupMemberPages(groupId, userId, pageKeys = []) {
  const response = await api.put(`/api/user-groups/${groupId}/members/${userId}/pages`, {
    pageKeys: Array.isArray(pageKeys) ? pageKeys : [],
  })
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.map((row) => ({
    userId: row?.userId,
    username: row?.username || '',
    role: row?.role || '',
    pageKeys: Array.isArray(row?.pageKeys) ? row.pageKeys : [],
  }))
}
