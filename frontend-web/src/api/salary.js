import api from './axios'

const data = (response) => response.data.data

export const salaryAPI = {
  list: async (params) => data(await api.get('/salary', { params })),
  update: async (employeeId, salary) =>
    data(await api.patch(`/salary/${employeeId}`, { salary })),
}

export default salaryAPI
