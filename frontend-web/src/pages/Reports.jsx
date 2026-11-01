import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportAPI } from '../api/reports'
import { departmentAPI } from '../api/departments'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { can } from '../utils/permissions'
import { formatRange, formatDateShort, todayISO } from '../utils/forms'
import PageHeader from '../components/PageHeader'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const monthStart = () => {
  const date = new Date()
  date.setDate(1)
  return date.toISOString().slice(0, 10)
}

const downloadCsv = (filename, rows) => {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function Reports() {
  const user = getUser()
  const [tab, setTab] = useState('attendance')
  const [range, setRange] = useState({ from: monthStart(), to: todayISO() })
  const [departmentId, setDepartmentId] = useState('')

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentAPI.list(),
    enabled: can(user, 'departments', PERMISSIONS.canRead),
  })
  const departments = departmentsQuery.data || []

  const attendanceQuery = useQuery({
    queryKey: ['reports', 'attendance', range, departmentId],
    queryFn: () =>
      reportAPI.attendance({
        from: range.from || undefined,
        to: range.to || undefined,
        departmentId: departmentId || undefined,
      }),
    enabled: tab === 'attendance',
  })

  const leaveQuery = useQuery({
    queryKey: ['reports', 'leave', range],
    queryFn: () =>
      reportAPI.leave({ from: range.from || undefined, to: range.to || undefined }),
    enabled: tab === 'leave',
  })

  const attendance = attendanceQuery.data
  const leave = leaveQuery.data

  const exportRows = useMemo(() => {
    if (tab === 'attendance' && attendance) return attendance.byEmployee
    if (tab === 'leave' && leave) {
      return leave.requests.map((request) => ({
        employee: request.employeeId?.name || '',
        type: request.type,
        startDate: formatDateShort(request.startDate),
        endDate: formatDateShort(request.endDate),
        status: request.status,
        reason: request.reason || '',
      }))
    }
    return []
  }, [tab, attendance, leave])

  const activeQuery = tab === 'attendance' ? attendanceQuery : leaveQuery

  return (
    <>
      <PageHeader
        eyebrow="INSIGHTS"
        title="Reports"
        subtitle="Analyse attendance trends and leave usage across any date range."
        action={
          <button
            className="ghost-button"
            type="button"
            onClick={() => downloadCsv(`${tab}-report.csv`, exportRows)}
            disabled={!exportRows.length}
          >
            Export CSV
          </button>
        }
      />

      <div className="tabs">
        <button
          type="button"
          className={tab === 'attendance' ? 'tab active' : 'tab'}
          onClick={() => setTab('attendance')}
        >
          Attendance
        </button>
        <button
          type="button"
          className={tab === 'leave' ? 'tab active' : 'tab'}
          onClick={() => setTab('leave')}
        >
          Leave
        </button>
      </div>

      <section className="panel flat-panel">
        <div className="toolbar">
          <label className="inline-field">
            From
            <input
              type="date"
              className="compact-input"
              value={range.from}
              onChange={(event) => setRange({ ...range, from: event.target.value })}
            />
          </label>
          <label className="inline-field">
            To
            <input
              type="date"
              className="compact-input"
              value={range.to}
              onChange={(event) => setRange({ ...range, to: event.target.value })}
            />
          </label>
          {tab === 'attendance' && departments.length > 0 && (
            <select
              className="compact-input"
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          )}
          <span className="toolbar-note">{formatRange(range.from, range.to)}</span>
        </div>

        {activeQuery.isLoading ? (
          <Loading text="Building report..." />
        ) : activeQuery.isError ? (
          <Notice type="error">
            {activeQuery.error?.response?.data?.message || 'Unable to load this report.'}
          </Notice>
        ) : tab === 'attendance' && attendance ? (
          <>
            <div className="mini-stats report-stats">
              <div className="mini-stat">
                <span>Attendance rate</span>
                <strong>{attendance.totals.attendanceRate}%</strong>
              </div>
              <div className="mini-stat">
                <span>On time</span>
                <strong>{attendance.totals.present}</strong>
              </div>
              <div className="mini-stat">
                <span>Late</span>
                <strong>{attendance.totals.late}</strong>
              </div>
              <div className="mini-stat">
                <span>Absent</span>
                <strong>{attendance.totals.absent}</strong>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>PRESENT</th>
                    <th>LATE</th>
                    <th>ABSENT</th>
                    <th>ON LEAVE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.byEmployee.length === 0 ? (
                    <tr>
                      <td className="empty-row" colSpan={6}>
                        No attendance records in this period.
                      </td>
                    </tr>
                  ) : (
                    attendance.byEmployee.map((row) => (
                      <tr key={row.employeeId}>
                        <td>
                          <strong>{row.name || 'Employee'}</strong>
                        </td>
                        <td>{row.present}</td>
                        <td>{row.late}</td>
                        <td>{row.absent}</td>
                        <td>{row.onLeave}</td>
                        <td>{row.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : leave ? (
          <>
            <div className="mini-stats report-stats">
              <div className="mini-stat">
                <span>Requests</span>
                <strong>{leave.totals.requests}</strong>
              </div>
              <div className="mini-stat">
                <span>Pending</span>
                <strong>{leave.totals.PENDING || 0}</strong>
              </div>
              <div className="mini-stat">
                <span>Approved</span>
                <strong>{leave.totals.APPROVED || 0}</strong>
              </div>
              <div className="mini-stat">
                <span>Rejected</span>
                <strong>{leave.totals.REJECTED || 0}</strong>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>TYPE</th>
                    <th>START</th>
                    <th>END</th>
                    <th>STATUS</th>
                    <th>REASON</th>
                  </tr>
                </thead>
                <tbody>
                  {leave.requests.length === 0 ? (
                    <tr>
                      <td className="empty-row" colSpan={6}>
                        No leave requests in this period.
                      </td>
                    </tr>
                  ) : (
                    leave.requests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          <strong>{request.employeeId?.name || 'Employee'}</strong>
                        </td>
                        <td>{request.type}</td>
                        <td className="muted">{formatDateShort(request.startDate)}</td>
                        <td className="muted">{formatDateShort(request.endDate)}</td>
                        <td>{request.status}</td>
                        <td className="muted truncated">{request.reason || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </>
  )
}

export default Reports
