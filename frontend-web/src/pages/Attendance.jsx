import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceAPI } from '../api/attendance'
import { employeeAPI } from '../api/employees'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { STATUS_LABELS, formatTime, statusClass, getInitials } from '../utils/format'
import { formatDateShort, todayISO } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const STATUSES = ['PRESENT', 'LATE', 'ON_LEAVE', 'ABSENT']
const TEAM_ROLES = ['SUPER_ADMIN', 'COMPANY_OWNER', 'HR_ADMIN', 'MANAGER']

const buildTimestamp = (date, time) => {
  if (!date || !time) return null
  return new Date(`${date}T${time}:00`).toISOString()
}

const timeValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function Attendance() {
  const user = getUser()
  const queryClient = useQueryClient()
  const isTeamView = TEAM_ROLES.includes(user?.role)

  const [filters, setFilters] = useState({ from: todayISO(), to: todayISO(), status: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    employeeId: '',
    date: todayISO(),
    status: 'PRESENT',
    checkIn: '09:00',
    checkOut: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const listParams = {
    from: filters.from || undefined,
    to: filters.to || undefined,
    status: filters.status || undefined,
  }

  const recordsQuery = useQuery({
    queryKey: ['attendance', 'list', isTeamView, listParams],
    queryFn: () =>
      isTeamView ? attendanceAPI.list(listParams) : attendanceAPI.mine(listParams),
  })
  const records = recordsQuery.data || []

  const employeesQuery = useQuery({
    queryKey: ['employees', { search: undefined }],
    queryFn: () => employeeAPI.list(),
    enabled: isTeamView && can(user, 'employees', PERMISSIONS.canRead),
  })
  const employees = employeesQuery.data || []

  const stats = useMemo(
    () => ({
      present: records.filter((record) => record.status === 'PRESENT').length,
      late: records.filter((record) => record.status === 'LATE').length,
      onLeave: records.filter((record) => record.status === 'ON_LEAVE').length,
      absent: records.filter((record) => record.status === 'ABSENT').length,
    }),
    [records]
  )

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editing
        ? attendanceAPI.update(editing.id, {
            status: payload.status,
            checkIn: payload.checkIn,
            checkOut: payload.checkOut,
            notes: payload.notes,
          })
        : attendanceAPI.mark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      setModalOpen(false)
      setEditing(null)
      setError('')
      setMessage(editing ? 'Attendance updated.' : 'Attendance marked.')
    },
    onError: (err) => setError(err.response?.data?.message || 'Could not save attendance.'),
  })

  const openMark = () => {
    setEditing(null)
    setForm({
      employeeId: employees[0]?._id || '',
      date: todayISO(),
      status: 'PRESENT',
      checkIn: '09:00',
      checkOut: '',
      notes: '',
    })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    setForm({
      employeeId: record.employeeId,
      date: new Date(record.date).toISOString().slice(0, 10),
      status: record.status,
      checkIn: timeValue(record.checkIn),
      checkOut: timeValue(record.checkOut),
      notes: record.notes || '',
    })
    setError('')
    setMessage('')
    setModalOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const base = {
      status: form.status,
      notes: form.notes,
      checkIn: buildTimestamp(form.date, form.checkIn),
      checkOut: buildTimestamp(form.date, form.checkOut),
    }

    if (editing) {
      saveMutation.mutate(base)
      return
    }

    saveMutation.mutate({
      ...base,
      employeeId: form.employeeId,
      date: new Date(`${form.date}T00:00:00`).toISOString(),
    })
  }

  const canManage = isTeamView && can(user, 'attendance', PERMISSIONS.canUpdate)

  return (
    <>
      <PageHeader
        eyebrow="TIME & ATTENDANCE"
        title="Attendance"
        subtitle="Review daily check-ins, late arrivals and absences across your team."
        action={
          canManage ? (
            <button className="primary-button" type="button" onClick={openMark}>
              <span>＋</span> Mark attendance
            </button>
          ) : null
        }
      />

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <section className="mini-stats">
        <div className="mini-stat">
          <span>On time</span>
          <strong>{stats.present}</strong>
        </div>
        <div className="mini-stat">
          <span>Late</span>
          <strong>{stats.late}</strong>
        </div>
        <div className="mini-stat">
          <span>On leave</span>
          <strong>{stats.onLeave}</strong>
        </div>
        <div className="mini-stat">
          <span>Absent</span>
          <strong>{stats.absent}</strong>
        </div>
      </section>

      <section className="panel flat-panel">
        <div className="toolbar">
          <label className="inline-field">
            From
            <input
              type="date"
              className="compact-input"
              value={filters.from}
              onChange={(event) => setFilters({ ...filters, from: event.target.value })}
            />
          </label>
          <label className="inline-field">
            To
            <input
              type="date"
              className="compact-input"
              value={filters.to}
              onChange={(event) => setFilters({ ...filters, to: event.target.value })}
            />
          </label>
          <select
            className="compact-input"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setFilters({ from: todayISO(), to: todayISO(), status: '' })}
          >
            Today
          </button>
        </div>

        {recordsQuery.isLoading ? (
          <Loading text="Loading attendance..." />
        ) : recordsQuery.isError ? (
          <div className="inline-error">
            {recordsQuery.error?.response?.data?.message || 'Unable to load attendance.'}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DATE</th>
                  <th>CHECK-IN</th>
                  <th>CHECK-OUT</th>
                  <th>STATUS</th>
                  <th>NOTES</th>
                  {canManage && <th />}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td className="empty-row" colSpan={canManage ? 7 : 6}>
                      No attendance records for this period.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="person">
                          <div className={`avatar avatar-${record.color || 'blue'}`}>
                            {record.initials || getInitials(record.name)}
                          </div>
                          <div>
                            <strong>{record.name}</strong>
                            <small>{record.role || 'Team member'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{formatDateShort(record.date)}</td>
                      <td className="time">{formatTime(record.checkIn)}</td>
                      <td className="time">{formatTime(record.checkOut)}</td>
                      <td>
                        <span className={`status ${statusClass(record.status)}`}>
                          <i />
                          {STATUS_LABELS[record.status] || record.status}
                        </span>
                      </td>
                      <td className="muted">{record.notes || '—'}</td>
                      {canManage && (
                        <td className="row-actions">
                          <button
                            className="text-button"
                            type="button"
                            onClick={() => openEdit(record)}
                          >
                            Edit
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
          Showing <b>{records.length}</b> records
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit attendance' : 'Mark attendance'}
        subtitle="Set the check-in and check-out times for this day."
        onClose={() => setModalOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="attendance-employee">Employee</label>
            <select
              id="attendance-employee"
              value={form.employeeId}
              onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
              disabled={Boolean(editing)}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="attendance-date">Date</label>
            <input
              id="attendance-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              disabled={Boolean(editing)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="attendance-checkin">Check-in</label>
            <input
              id="attendance-checkin"
              type="time"
              value={form.checkIn}
              onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="attendance-checkout">Check-out</label>
            <input
              id="attendance-checkout"
              type="time"
              value={form.checkOut}
              onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="attendance-status">Status</label>
            <select
              id="attendance-status"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="attendance-notes">Notes</label>
            <input
              id="attendance-notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="Optional note"
            />
          </div>
          <div className="form-actions full-span">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Save changes' : 'Mark attendance'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default Attendance
