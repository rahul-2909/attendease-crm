import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { clearAuth, isAuthenticated } from '../utils/auth'
import useAuthUser from '../hooks/useAuthUser'
import { BOTTOM_NAV_ITEMS, NAV_ITEMS, can } from '../utils/permissions'

const MODULE_BY_PATH = {
  '/': 'dashboard',
  '/employees': 'employees',
  '/departments': 'departments',
  '/projects': 'projects',
  '/attendance': 'attendance',
  '/leave': 'leave',
  '/shifts': 'shifts',
  '/reports': 'reports',
  '/salary': 'salary',
  '/settings': 'settings',
  '/permissions': 'permissions',
}

function ProtectedRoute() {
  const location = useLocation()
  const user = useAuthUser()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const module = MODULE_BY_PATH[location.pathname]
  if (module && !can(user, module)) {
    const firstAvailable = [...NAV_ITEMS, ...BOTTOM_NAV_ITEMS].find((item) =>
      can(user, item.module)
    )

    if (firstAvailable) return <Navigate to={firstAvailable.path} replace />

    return (
      <main className="state-screen inline-state">
        <p>Your account currently has no accessible modules.</p>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            clearAuth()
            window.location.assign('/login')
          }}
        >
          Sign out
        </button>
      </main>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
