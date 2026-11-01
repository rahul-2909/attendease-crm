import api from './axios'

const data = (response) => response.data.data

export const shiftAPI = {
  list: async () => data(await api.get('/shifts')),
  create: async (payload) => data(await api.post('/shifts', payload)),
  update: async (id, payload) => data(await api.patch(`/shifts/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/shifts/${id}`)),
}

export const locationAPI = {
  list: async () => data(await api.get('/locations')),
  create: async (payload) => data(await api.post('/locations', payload)),
  update: async (id, payload) => data(await api.patch(`/locations/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/locations/${id}`)),
}

export default shiftAPI
