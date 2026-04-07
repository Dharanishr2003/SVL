import api from '../utils/api';

export const getServiceTypes = () =>
  api.get('/api/service-types').then(r => r.data);

export const createServiceType = (data) =>
  api.post('/api/service-types', {
    name: data.name,
    categoryId: data.categoryId,
    parentId: data.parentId || null
  }).then(r => r.data);

export const updateServiceType = (id, data) =>
  api.put(`/api/service-types/${id}`, {
    name: data.name,
    categoryId: data.categoryId,
    parentId: data.parentId || null
  }).then(r => r.data);

export const deleteServiceType = (id) =>
  api.delete(`/api/service-types/${id}`);
