import api from './axios'

const data = (response) => response.data.data

export const projectAPI = {
  list: async (params) => data(await api.get('/projects', { params })),
  create: async (payload) => data(await api.post('/projects', payload)),
  update: async (id, payload) => data(await api.patch(`/projects/${id}`, payload)),
  remove: async (id) => data(await api.delete(`/projects/${id}`)),
}

export default projectAPI
