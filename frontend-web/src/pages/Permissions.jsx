import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { permissionAPI } from '../api/permissions'
import { PERMISSIONS } from '../constants/permissions'
import { getToken, getUser, setAuth } from '../utils/auth'
import { can } from '../utils/permissions'
import { ROLE_LABELS } from '../utils/format'
import PageHeader from '../components/PageHeader'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const ROLES = ['COMPANY_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']
const ACTIONS = [
  { key: PERMISSIONS.canRead, label: 'View' },
  { key: PERMISSIONS.canCreate, label: 'Create' },
  { key: PERMISSIONS.canUpdate, label: 'Update' },
  { key: PERMISSIONS.canDelete, label: 'Delete' },
]
const MODULES = [
  ['dashboard', 'Dashboard'],
  ['employees', 'Employees'],
  ['departments', 'Departments'],
  ['projects', 'Projects'],
  ['attendance', 'Attendance'],
  ['leave', 'Leave'],
  ['shifts', 'Shifts & locations'],
  ['reports', 'Reports'],
  ['salary', 'Salary'],
  ['settings', 'Settings'],
  ['permissions', 'Role permissions'],
]

function Permissions() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [role, setRole] = useState('HR_ADMIN')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionAPI.list(),
  })
  const matrix = permissionsQuery.data?.[role] || {}

  const updateMutation = useMutation({
    mutationFn: ({ module, action, value }) => permissionAPI.update(role, module, action, value),
    onSuccess: (nextMatrix) => {
      queryClient.setQueryData(['permissions'], (current) => ({
        ...(current || {}),
        [role]: nextMatrix,
      }))
      if (user?.role === role) {
        setAuth(getToken(), { ...user, modulePermissions: nextMatrix })
      }
      setError('')
      setMessage('Permission updated.')
    },
    onError: (err) => {
      setMessage('')
      setError(err.response?.data?.message || 'Could not update permission.')
    },
  })

  const isLocked = (module, action) =>
    role === 'COMPANY_OWNER' &&
    module === 'permissions' &&
    (action === PERMISSIONS.canRead || action === PERMISSIONS.canUpdate)

  const handleToggle = (module, action, value) => {
    setMessage('')
    updateMutation.mutate({ module, action, value })
  }

  const canEdit = can(user, 'permissions', PERMISSIONS.canUpdate)

  return (
    <>
      <PageHeader
        eyebrow="ACCESS CONTROL"
        title="Role permissions"
        subtitle="Control exactly what each role can view, create, update and delete."
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <section className="permission-rules">
        <article>
          <strong>View is the gateway</strong>
          <p>Turning view off automatically disables create, update and delete.</p>
        </article>
        <article>
          <strong>Actions imply view</strong>
          <p>Enabling any action turns view on so the module stays reachable.</p>
        </article>
        <article>
          <strong>Owner lockout</strong>
          <p>The company owner always retains Role Permissions view and update.</p>
        </article>
      </section>

      <div className="tabs">
        {ROLES.map((roleKey) => (
          <button
            key={roleKey}
            type="button"
            className={role === roleKey ? 'tab active' : 'tab'}
            onClick={() => {
              setRole(roleKey)
              setError('')
              setMessage('')
            }}
          >
            {ROLE_LABELS[roleKey]}
          </button>
        ))}
      </div>

      {permissionsQuery.isLoading ? (
        <Loading text="Loading permissions..." />
      ) : permissionsQuery.isError ? (
        <div className="inline-error">
          {permissionsQuery.error?.response?.data?.message || 'Unable to load permissions.'}
        </div>
      ) : (
        <section className="panel flat-panel">
          <div className="table-wrap">
            <table className="data-table permission-table">
              <thead>
                <tr>
                  <th>MODULE</th>
                  {ACTIONS.map((action) => (
                    <th key={action.key} className="center">
                      {action.label.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(([moduleKey, label]) => {
                  const permission = matrix[moduleKey] || {}
                  return (
                    <tr key={moduleKey}>
                      <td>
                        <strong>{label}</strong>
                        <small className="row-note">
                          {permission.view ? 'Visible to this role' : 'Hidden from this role'}
                        </small>
                      </td>
                      {ACTIONS.map((action) => (
                        <td key={action.key} className="center">
                          <label
                            className={
                              isLocked(moduleKey, action.key)
                                ? 'switch locked'
                                : 'switch'
                            }
                            title={
                              isLocked(moduleKey, action.key)
                                ? 'Owner must retain this permission'
                                : ''
                            }
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(permission[action.key])}
                              disabled={
                                !canEdit ||
                                updateMutation.isPending ||
                                isLocked(moduleKey, action.key)
                              }
                              onChange={(event) =>
                                handleToggle(moduleKey, action.key, event.target.checked)
                              }
                              aria-label={`${label} ${action.label}`}
                            />
                            <span />
                          </label>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!canEdit && (
        <p className="side-note">You have view-only access to role permissions.</p>
      )}
    </>
  )
}

export default Permissions
