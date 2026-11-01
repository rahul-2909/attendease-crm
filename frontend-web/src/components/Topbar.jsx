import { useLocation } from 'react-router-dom'
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from '../utils/permissions'

const TITLES = [...NAV_ITEMS, ...BOTTOM_NAV_ITEMS]

function Topbar({ initials }) {
  const { pathname } = useLocation()
  const current = TITLES.find((item) =>
    item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
  )

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Workspace <span>/</span> {current?.label || 'Dashboard'}
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          ♧<i />
        </button>
        <div className="avatar avatar-blue">{initials}</div>
      </div>
    </header>
  )
}

export default Topbar
