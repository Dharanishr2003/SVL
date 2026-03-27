import api from '../utils/api'

export async function getRrqTypes() {
  const response = await api.get('/api/rrq-types')
  return Array.isArray(response?.data) ? response.data : []
}

export async function createRrqType(rrqType) {
  const response = await api.post('/api/rrq-types', { rrqType })
  return response?.data
}

export async function updateRrqType(id, rrqType) {
  const response = await api.put(`/api/rrq-types/${id}`, { rrqType })
  return response?.data
}

export async function deleteRrqType(id) {
  const response = await api.delete(`/api/rrq-types/${id}`)
  return response?.data
}
