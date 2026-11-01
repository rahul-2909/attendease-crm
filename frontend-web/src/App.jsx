import { Outlet } from 'react-router-dom'
import { getInitials } from './utils/format'
import { visibleNav, visibleBottomNav } from './utils/permissions'
import useAuthUser from './hooks/useAuthUser'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

function App() {
  const user = useAuthUser()

  return (
    <main className="shell">
      <Sidebar
        user={user}
        navItems={visibleNav(user)}
        bottomItems={visibleBottomNav(user)}
      />
      <section className="content">
        <Topbar initials={getInitials(user?.name || '')} />
        <div className="page">
          <Outlet />
          <footer>
            © 2026 Shiftly <span>·</span> Making workdays work better.
          </footer>
        </div>
      </section>
    </main>
  )
}

export default App
