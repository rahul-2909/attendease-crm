import api from './axios'

const data = (response) => response.data.data

export const permissionAPI = {
  list: async () => data(await api.get('/permissions')),
  update: async (role, module, action, value) =>
    data(await api.patch(`/permissions/${role}`, { module, action, value })),
}

export default permissionAPI
