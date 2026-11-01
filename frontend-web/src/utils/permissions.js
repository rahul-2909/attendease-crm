import { PERMISSIONS } from '../constants/permissions.js'

export const NAV_ITEMS = [
  { module: 'dashboard', label: 'Dashboard', path: '/', icon: '▦' },
  { module: 'employees', label: 'Employees', path: '/employees', icon: '♙' },
  { module: 'departments', label: 'Departments', path: '/departments', icon: '▤' },
  { module: 'projects', label: 'Projects', path: '/projects', icon: '◧' },
  { module: 'attendance', label: 'Attendance', path: '/attendance', icon: '◷' },
  { module: 'leave', label: 'Leave', path: '/leave', icon: '▥' },
  { module: 'shifts', label: 'Shifts', path: '/shifts', icon: '◔' },
  { module: 'reports', label: 'Reports', path: '/reports', icon: '▨' },
  { module: 'salary', label: 'Salary', path: '/salary', icon: '₹' },
]

export const BOTTOM_NAV_ITEMS = [
  { module: 'settings', label: 'Settings', path: '/settings', icon: '⚙' },
  { module: 'permissions', label: 'Permissions', path: '/permissions', icon: '⚿' },
]

export const can = (user, module, action = PERMISSIONS.canRead) => {
  if (!user) return false
  if (user.role === 'SUPER_ADMIN') return true

  const permission = user.modulePermissions?.[module]
  if (!permission) return false
  if (!permission.view) return false
  if (action === PERMISSIONS.canRead) return true
  return Boolean(permission[action])
}

export const visibleNav = (user) =>
  NAV_ITEMS.filter((item) => can(user, item.module, PERMISSIONS.canRead))

export const visibleBottomNav = (user) =>
  BOTTOM_NAV_ITEMS.filter((item) => can(user, item.module, PERMISSIONS.canRead))
