import { useQuery } from '@tanstack/react-query'
import { attendanceAPI } from '../api/attendance'

export const useAttendanceOverview = (date, options = {}) => {
  return useQuery({
    queryKey: ['attendance', 'overview', date || 'today'],
    queryFn: () => attendanceAPI.getOverview(date),
    ...options,
  })
}

export const useMyAttendance = (params, options = {}) => {
  return useQuery({
    queryKey: ['attendance', 'me', params],
    queryFn: () => attendanceAPI.mine(params),
    ...options,
  })
}
