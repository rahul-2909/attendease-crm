import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { employeeAPI } from '../api/employees'
import { departmentAPI } from '../api/departments'
import { projectAPI } from '../api/projects'
import { shiftAPI } from '../api/shifts'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { getInitials } from '../utils/format'
import { formatCurrency, todayISO } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const EMPTY_FORM = {
  name: '',
  employeeCode: '',
  role: '',
  email: '',
  phone: '',
  designation: '',
  departmentId: '',
  projectId: '',
  shiftId: '',
  managerId: '',
  salary: '',
  joiningDate: '',
  isActive: true,
}

const toForm = (employee) => ({
  name: employee.name || '',
  employeeCode: employee.employeeCode || '',
  role: employee.role || '',
  email: employee.email || '',
  phone: employee.phone || '',
  designation: employee.designation || '',
  departmentId: employee.departmentId?._id || '',
  projectId: employee.projectId?._id || '',
  shiftId: employee.shiftId?._id || '',
  managerId: employee.managerId?._id || '',
  salary: employee.salary ?? '',
  joiningDate: employee.joiningDate ? employee.joiningDate.slice(0, 10) : '',
  isActive: employee.isActive !== false,
})

function Employees() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const params = { search: search || undefined, departmentId: departmentFilter || undefined }
  const employeesQuery = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeAPI.list(params),
  })
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentAPI.list(),
  })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: () => projectAPI.list() })
  const shiftsQuery = useQuery({ queryKey: ['shifts'], queryFn: () => shiftAPI.list() })

  const employees = employeesQuery.data || []
  const departments = departmentsQuery.data || []
  const projects = projectsQuery.data || []
  const shifts = shiftsQuery.data || []

  const stats = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((employee) => employee.isActive !== false).length,
      payroll: employees.reduce((sum, employee) => sum + (Number(employee.salary) || 0), 0),
    }),
    [employees]
  )

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing ? employeeAPI.update(editing._id, payload) : employeeAPI.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['salary'] })
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      setError('')
      setMessage(editing ? 'Employee updated.' : 'Employee added.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save employee.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => employeeAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      setMessage('Employee deactivated.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not deactivate employee.'),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, joiningDate: todayISO() })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (employee) => {
    setEditing(employee)
    setForm(toForm(employee))
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      salary: form.salary === '' ? undefined : Number(form.salary),
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '' || payload[key] === undefined) delete payload[key]
    })
    saveMutation.mutate(payload)
  }

  const handleDelete = (employee) => {
    if (window.confirm(`Deactivate ${employee.name}?`)) deleteMutation.mutate(employee._id)
  }

  const canCreate = can(user, 'employees', PERMISSIONS.canCreate)
  const canUpdate = can(user, 'employees', PERMISSIONS.canUpdate)
  const canDelete = can(user, 'employees', PERMISSIONS.canDelete)

  return (
    <>
      <PageHeader
        eyebrow="PEOPLE"
        title="Employees"
        subtitle="Manage your team directory, assignments and payroll."
        action={
          canCreate ? (
            <button className="primary-button" type="button" onClick={openCreate}>
              <span>＋</span> Add employee
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <section className="mini-stats">
        <div className="mini-stat">
          <span>Total employees</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="mini-stat">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>
        <div className="mini-stat">
          <span>Monthly payroll</span>
          <strong>{formatCurrency(stats.payroll)}</strong>
        </div>
        <div className="mini-stat">
          <span>Departments</span>
          <strong>{departments.length}</strong>
        </div>
      </section>

      <section className="panel flat-panel">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search by name, code or email"
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

        {employeesQuery.isLoading ? (
          <Loading text="Loading employees..." />
        ) : employeesQuery.isError ? (
          <div className="inline-error">
            {employeesQuery.error?.response?.data?.message || 'Unable to load employees.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>CODE</th>
                  <th>DEPARTMENT</th>
                  <th>PROJECT</th>
                  <th>SHIFT</th>
                  <th>SALARY</th>
                  <th>STATUS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={8}>
                      No employees found.
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
                            <small>
                              {employee.designation || employee.role || 'Team member'}
                              {employee.email ? ` · ${employee.email}` : ''}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{employee.employeeCode || '—'}</td>
                      <td>{employee.departmentId?.name || '—'}</td>
                      <td>{employee.projectId?.name || '—'}</td>
                      <td>{employee.shiftId?.name || '—'}</td>
                      <td className="money">{formatCurrency(employee.salary)}</td>
                      <td>
                        <span
                          className={`status ${
                            employee.isActive === false ? 'status-absent' : 'status-present'
                          }`}
                        >
                          <i />
                          {employee.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="row-actions">
                        {canUpdate && (
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => openEdit(employee)}
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && employee.isActive !== false && (
                          <button
                            className="text-button danger"
                            type="button"
                            onClick={() => handleDelete(employee)}
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
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
        open={modalOpen}
        title={editing ? 'Edit employee' : 'Add employee'}
        subtitle="Update your team member's profile and workplace details."
        onClose={() => setModalOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="employeeCode">Employee code</label>
            <input
              id="employeeCode"
              name="employeeCode"
              value={form.employeeCode}
              onChange={handleChange}
              placeholder="EMP001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@company.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="role">Job role</label>
            <input
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Product designer"
            />
          </div>
          <div className="form-group">
            <label htmlFor="designation">Designation</label>
            <input
              id="designation"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Senior designer"
            />
          </div>
          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="projectId">Project</label>
            <select id="projectId" name="projectId" value={form.projectId} onChange={handleChange}>
              <option value="">Unassigned</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="shiftId">Shift</label>
            <select id="shiftId" name="shiftId" value={form.shiftId} onChange={handleChange}>
              <option value="">Default shift</option>
              {shifts.map((shift) => (
                <option key={shift._id} value={shift._id}>
                  {shift.name} ({shift.startTime}–{shift.endTime})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="managerId">Reports to</label>
            <select id="managerId" name="managerId" value={form.managerId} onChange={handleChange}>
              <option value="">No manager</option>
              {employees
                .filter((employee) => employee._id !== editing?._id)
                .map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="salary">Monthly salary (INR)</label>
            <input
              id="salary"
              name="salary"
              type="number"
              min="0"
              value={form.salary}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="joiningDate">Joining date</label>
            <input
              id="joiningDate"
              name="joiningDate"
              type="date"
              value={form.joiningDate}
              onChange={handleChange}
            />
          </div>
          <label className="checkbox-field full-span">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Employee is active
          </label>

          <div className="form-actions full-span">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Employees
