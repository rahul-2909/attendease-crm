import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { salaryAPI } from '../api/salary'
import { departmentAPI } from '../api/departments'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { getInitials } from '../utils/format'
import { formatCurrency } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

function Salary() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [salary, setSalary] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const params = {
    search: search || undefined,
    departmentId: departmentFilter || undefined,
  }
  const salariesQuery = useQuery({
    queryKey: ['salary', params],
    queryFn: () => salaryAPI.list(params),
  })
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentAPI.list(),
    enabled: can(user, 'departments', PERMISSIONS.canRead),
  })
  const employees = salariesQuery.data || []
  const departments = departmentsQuery.data || []

  const stats = useMemo(() => {
    const total = employees.reduce((sum, employee) => sum + (Number(employee.salary) || 0), 0)
    const count = employees.filter((employee) => Number(employee.salary) > 0).length
    return {
      total,
      average: count ? Math.round(total / count) : 0,
      highest: employees.reduce(
        (max, employee) => Math.max(max, Number(employee.salary) || 0),
        0
      ),
      headcount: employees.length,
    }
  }, [employees])

  const updateMutation = useMutation({
    mutationFn: ({ employeeId, value }) => salaryAPI.update(employeeId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] })
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      setEditing(null)
      setError('')
      setMessage('Salary updated.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not update salary.'),
  })

  const openEdit = (employee) => {
    setEditing(employee)
    setSalary(employee.salary ?? 0)
    setError('')
    setMessage('')
  }

  const submit = (event) => {
    event.preventDefault()
    updateMutation.mutate({ employeeId: editing._id, value: Number(salary) || 0 })
  }

  const canUpdate = can(user, 'salary', PERMISSIONS.canUpdate)

  return (
    <>
      <PageHeader
        eyebrow="PAYROLL"
        title="Salary"
        subtitle="Keep compensation records up to date for every team member."
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <section className="mini-stats">
        <div className="mini-stat">
          <span>Monthly payroll</span>
          <strong>{formatCurrency(stats.total)}</strong>
        </div>
        <div className="mini-stat">
          <span>Average salary</span>
          <strong>{formatCurrency(stats.average)}</strong>
        </div>
        <div className="mini-stat">
          <span>Highest salary</span>
          <strong>{formatCurrency(stats.highest)}</strong>
        </div>
        <div className="mini-stat">
          <span>Employees</span>
          <strong>{stats.headcount}</strong>
        </div>
      </section>

      <section className="panel flat-panel">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search employees"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="compact-input"
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
          >
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {salariesQuery.isLoading ? (
          <Loading text="Loading salaries..." />
        ) : salariesQuery.isError ? (
          <div className="inline-error">
            {salariesQuery.error?.response?.data?.message || 'Unable to load salaries.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>PROJECT</th>
                  <th>MONTHLY SALARY</th>
                  {canUpdate && <th />}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={canUpdate ? 6 : 5}>
                      No salary records found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="person">
                          <div className={`avatar avatar-${employee.color || 'blue'}`}>
                            {employee.initials || getInitials(employee.name)}
                          </div>
                          <div>
                            <strong>{employee.name}</strong>
                            <small>{employee.employeeCode || employee.email || '—'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{employee.departmentId?.name || '—'}</td>
                      <td className="muted">{employee.designation || employee.role || '—'}</td>
                      <td>{employee.projectId?.name || '—'}</td>
                      <td className="money">{formatCurrency(employee.salary)}</td>
                      {canUpdate && (
                        <td className="row-actions">
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => openEdit(employee)}
                          >
                            Edit salary
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          Showing <b>{employees.length}</b> employees
        </div>
      </section>

      <Modal
        open={Boolean(editing)}
        title="Update salary"
        subtitle={editing ? `${editing.name} · ${editing.designation || editing.role || 'Employee'}` : ''}
        onClose={() => setEditing(null)}
      >
        <form className="form-grid single" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="salary-value">Monthly salary (INR)</label>
            <input
              id="salary-value"
              type="number"
              min="0"
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="ghost-button" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save salary'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Salary
