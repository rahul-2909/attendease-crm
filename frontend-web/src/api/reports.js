import api from './axios'

const data = (response) => response.data.data

export const reportAPI = {
  attendance: async (params) => data(await api.get('/reports/attendance', { params })),
  leave: async (params) => data(await api.get('/reports/leave', { params })),
}

export default reportAPI
