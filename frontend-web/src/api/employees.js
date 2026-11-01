import api from './axios'

const data = (response) => response.data.data

export const employeeAPI = {
  list: async (params) => data(await api.get('/employees', { params })),
  get: async (id) => data(await api.get(`/employees/${id}`)),
  create: async (payload) => data(await api.post('/employees', payload)),
  update: async (id, payload) => data(await api.patch(`/employees/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/employees/${id}`)),
}

export default employeeAPI
