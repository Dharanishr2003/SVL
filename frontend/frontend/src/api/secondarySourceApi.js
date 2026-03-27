import api from '../utils/api'

export async function getSecondarySources() {
  const response = await api.get('/api/secondary-sources')
  return Array.isArray(response?.data) ? response.data : []
}

export async function createSecondarySource(secondarySource) {
  const response = await api.post('/api/secondary-sources', { secondarySource })
  return response?.data
}

export async function updateSecondarySource(id, secondarySource) {
  const response = await api.put(`/api/secondary-sources/${id}`, { secondarySource })
  return response?.data
}

export async function deleteSecondarySource(id) {
  const response = await api.delete(`/api/secondary-sources/${id}`)
  return response?.data
}
