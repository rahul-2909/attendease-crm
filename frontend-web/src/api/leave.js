import api from './axios'

const data = (response) => response.data.data

export const leaveAPI = {
  list: async (params) => data(await api.get('/leave', { params })),
  create: async (payload) => data(await api.post('/leave', payload)),
  review: async (id, payload) => data(await api.patch(`/leave/${id}/review`, payload)),
  cancel: async (id) => data(await api.patch(`/leave/${id}/cancel`)),
  remove: async (id) => data(await api.delete(`/leave/${id}`)),
}

export default leaveAPI
