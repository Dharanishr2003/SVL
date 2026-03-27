import api from '../utils/api'

export async function getChannelPartners() {
  const response = await api.get('/api/channel-partners')
  const data = response?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function createChannelPartner(payload) {
  const response = await api.post('/api/channel-partners', payload)
  return response?.data
}

export async function updateChannelPartner(id, payload) {
  const response = await api.put(`/api/channel-partners/${id}`, payload)
  return response?.data
}

export async function getChannelPartnerById(id) {
  const response = await api.get(`/api/channel-partners/${id}`)
  return response?.data || null
}

export async function getChannelPartnerAssignableOwners(id) {
  const response = await api.get(`/api/channel-partners/${id}/assignable-owners`)
  return Array.isArray(response?.data) ? response.data : []
}

export async function getChannelPartnerLogs(id) {
  const response = await api.get(`/api/channel-partners/${id}/logs`)
  return Array.isArray(response?.data) ? response.data : []
}

export async function getChannelPartnerLeads(id) {
  const response = await api.get(`/api/channel-partners/${id}/leads`)
  return Array.isArray(response?.data) ? response.data : []
}

export async function updateChannelPartnerOwner(id, ownerUserId) {
  const response = await api.patch(`/api/channel-partners/${id}/owner`, { ownerUserId })
  return response?.data
}

export async function deleteChannelPartner(id) {
  const response = await api.delete(`/api/channel-partners/${id}`)
  return response?.data
}
