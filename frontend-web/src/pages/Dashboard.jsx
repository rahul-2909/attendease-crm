import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAttendanceOverview, useMyAttendance } from '../hooks/useAttendance'
import { attendanceAPI } from '../api/attendance'
import { PERMISSIONS } from '../constants/permissions'
import { getUser } from '../utils/auth'
import { formatDateLabel, greetingFor } from '../utils/format'
import { can } from '../utils/permissions'
import StatsSection from '../components/StatsSection'
import AttendancePanel from '../components/AttendancePanel'
import QuickSummaryPanel from '../components/QuickSummaryPanel'
import Notice from '../components/Notice'
import Loading from '../components/Loading'

const todayValue = () => new Date().toISOString().slice(0, 10)

function Dashboard() {
  const user = getUser()
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayValue())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading, isError, error: queryError, refetch } = useAttendanceOverview(date)

  const { data: myAttendance } = useMyAttendance(
    { from: todayValue(), to: todayValue() },
    { enabled: Boolean(user), retry: false }
  )

  const todayRecord = (myAttendance || []).find(
    (record) => new Date(record.date).toDateString() === new Date().toDateString()
  )
  const canCheckIn = can(user, 'attendance', PERMISSIONS.canCreate)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance'] })
  }

  const checkInMutation = useMutation({
    mutationFn: attendanceAPI.checkIn,
    onSuccess: () => {
      setError('')
      setMessage('Checked in successfully.')
      invalidate()
    },
    onError: (err) => {
      setMessage('')
      setError(err.response?.data?.message || 'Could not check in.')
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: attendanceAPI.checkOut,
    onSuccess: () => {
      setError('')
      setMessage('Checked out successfully.')
      invalidate()
    },
    onError: (err) => {
      setMessage('')
      setError(err.response?.data?.message || 'Could not check out.')
    },
  })

  if (isLoading) return <Loading text="Loading dashboard..." />

  if (isError) {
    return (
      <div className="state-screen inline-state">
        <p>{queryError?.response?.data?.message || 'Unable to load the dashboard.'}</p>
        <button className="primary-button" type="button" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    )
  }

  if (!data) return null

  const { stats, attendance, summary } = data
  const firstName = (user?.name || data.user.name || '').split(' ')[0]

  const attendanceAction = canCheckIn ? (
    todayRecord?.checkIn && !todayRecord?.checkOut ? (
      <button
        className="primary-button"
        type="button"
        disabled={checkOutMutation.isPending}
        onClick={() => checkOutMutation.mutate()}
      >
        {checkOutMutation.isPending ? 'Checking out...' : '◷ Check out'}
      </button>
    ) : (
      <button
        className="primary-button"
        type="button"
        disabled={Boolean(todayRecord?.checkIn) || checkInMutation.isPending}
        onClick={() => checkInMutation.mutate()}
      >
        {checkInMutation.isPending
          ? 'Checking in...'
          : todayRecord?.checkIn
            ? '✓ Checked in'
            : '✓ Check in'}
      </button>
    )
  ) : null

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{formatDateLabel(data.date)}</p>
          <h1>
            {greetingFor(new Date())}, {firstName} <span>✦</span>
          </h1>
          <p className="subtitle">Here’s what’s happening with your team today.</p>
        </div>
        <div className="heading-actions">
          <input
            type="date"
            className="compact-input"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            aria-label="Report date"
          />
          {attendanceAction}
          {can(user, 'employees', PERMISSIONS.canCreate) && (
            <Link className="ghost-button" to="/employees">
              Manage team
            </Link>
          )}
        </div>
      </div>

      <Notice type="error">{error}</Notice>
      <Notice type="success">{message}</Notice>

      <StatsSection stats={stats} />

      <section className="main-grid">
        <AttendancePanel
          attendance={attendance}
          totalEmployees={stats.totalEmployees}
        />
        <QuickSummaryPanel stats={stats} summary={summary} />
      </section>
    </>
  )
}

export default Dashboard
