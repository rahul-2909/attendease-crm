import api from './axios'

const data = (response) => response.data.data

export const attendanceAPI = {
  getOverview: async (date) => {
    const response = await api.get('/attendance/overview', {
      params: date ? { date } : undefined,
    })
    return response.data.data
  },
  list: async (params) => data(await api.get('/attendance', { params })),
  mine: async (params) => data(await api.get('/attendance/me', { params })),
  checkIn: async () => data(await api.post('/attendance/check-in')),
  checkOut: async () => data(await api.post('/attendance/check-out')),
  mark: async (payload) => data(await api.post('/attendance', payload)),
  update: async (id, payload) => data(await api.patch(`/attendance/${id}`, payload)),
}

export default attendanceAPI
