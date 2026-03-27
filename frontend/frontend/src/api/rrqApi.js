import api from '../utils/api'

export async function getRrqs() {
  const response = await api.get('/api/rrq')
  return Array.isArray(response?.data) ? response.data : []
}

export async function createRrq(payload) {
  const response = await api.post('/api/rrq', payload)
  return response?.data
}

export async function updateRrq(id, payload) {
  const response = await api.put(`/api/rrq/${id}`, payload)
  return response?.data
}

export async function deleteRrq(id) {
  const response = await api.delete(`/api/rrq/${id}`)
  return response?.data
}
