import api from './axios'

const data = (response) => response.data.data

export const departmentAPI = {
  list: async (params) => data(await api.get('/departments', { params })),
  create: async (payload) => data(await api.post('/departments', payload)),
  update: async (id, payload) => data(await api.patch(`/departments/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/departments/${id}`)),
}

export default departmentAPI
