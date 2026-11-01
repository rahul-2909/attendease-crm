import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ROLE_LABELS, getInitials } from '../utils/format'
import { clearAuth } from '../utils/auth'

function Sidebar({ user, navItems = [], bottomItems = [] }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) return null

  const initials = getInitials(user.name)

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/" aria-label="Shiftly home">
        <span className="brand-mark">S</span>
        <span>shiftly</span>
      </NavLink>
      <p className="nav-label">WORKSPACE</p>
      <nav aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <nav aria-label="Workspace settings">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar avatar-blue">{initials}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{ROLE_LABELS[user.role] || user.role}</small>
          </div>
          <button
            type="button"
            className="profile-menu"
            aria-label="Account menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            ···
          </button>
          {menuOpen && (
            <div className="account-popover">
              <span>{user.email}</span>
              <button type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
