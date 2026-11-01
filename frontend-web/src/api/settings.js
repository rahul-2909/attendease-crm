import api from './axios'

const data = (response) => response.data.data

export const settingsAPI = {
  get: async () => data(await api.get('/settings')),
  update: async (payload) => data(await api.patch('/settings', payload)),
}

export default settingsAPI
