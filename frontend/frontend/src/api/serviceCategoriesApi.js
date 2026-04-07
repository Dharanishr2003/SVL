import api from '../utils/api';

export const getServiceCategories = () =>
  api.get('/api/service-categories').then(r => r.data);

export const createServiceCategory = (data) =>
  api.post('/api/service-categories', {
    name: data.name,
    isActive: data.isActive !== undefined ? data.isActive : true
  }).then(r => r.data);

export const updateServiceCategory = (id, data) =>
  api.put(`/api/service-categories/${id}`, {
    name: data.name,
    isActive: data.isActive !== undefined ? data.isActive : true
  }).then(r => r.data);

export const deleteServiceCategory = (id) =>
  api.delete(`/api/service-categories/${id}`);
