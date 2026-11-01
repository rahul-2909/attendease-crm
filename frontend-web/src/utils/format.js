export const STATUS_LABELS = {
  PRESENT: 'On time',
  LATE: 'Late',
  ON_LEAVE: 'On leave',
  ABSENT: 'Absent',
}

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super admin',
  COMPANY_OWNER: 'Company owner',
  HR_ADMIN: 'HR admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export const formatDateLabel = (value) => {
  if (!value) return ''
  return new Date(value)
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase()
}

export const formatTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const greetingFor = (value) => {
  const hour = new Date(value).getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const statusClass = (status) => {
  if (status === 'LATE') return 'status-late'
  if (status === 'ON_LEAVE') return 'status-leave'
  if (status === 'ABSENT') return 'status-absent'
  return 'status-present'
}
